// 오늘의 답변 저장 + 3명 모임 판정 — Vercel 서버리스 함수
import { sendEmail } from '../lib/resend.js';
import { SUPABASE_URL, sbHeaders, getAuthedUser, getUsersByIds } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // 출입증으로 진짜 사용자 확인 (클라이언트가 보내는 이메일은 더 이상 믿지 않아요)
    var user = await getAuthedUser(req);
    if (!user) {
      res.status(401).json({ error: 'login required' });
      return;
    }

    var body = req.body || {};
    var questionIndex = body.questionIndex;
    var answerDate = body.answerDate;
    var tone = body.tone;
    var text = body.body;

    if (questionIndex == null || !answerDate || !tone || !text) {
      res.status(400).json({ error: 'missing fields' });
      return;
    }

    // 오늘의 답변 upsert (이미 있으면 덮어쓰기)
    var upsertRes = await fetch(SUPABASE_URL + '/rest/v1/answers?on_conflict=user_id,answer_date', {
      method: 'POST',
      headers: sbHeaders({ 'Prefer': 'resolution=merge-duplicates' }),
      body: JSON.stringify({
        user_id: user.id,
        question_index: questionIndex,
        answer_date: answerDate,
        tone: tone,
        body: text
      })
    });
    if (!upsertRes.ok) {
      var errText = await upsertRes.text();
      res.status(502).json({ error: errText });
      return;
    }

    // 같은 질문, 같은 결, 아직 매칭되지 않은, 나 외의 답변들
    var poolRes = await fetch(
      SUPABASE_URL + '/rest/v1/answers' +
        '?answer_date=eq.' + answerDate +
        '&question_index=eq.' + questionIndex +
        '&tone=eq.' + tone +
        '&matched=eq.false' +
        '&user_id=neq.' + user.id +
        '&select=id,body,user_id&order=created_at.asc',
      { headers: sbHeaders() }
    );
    var pool = await poolRes.json();

    if (pool.length < 3) {
      res.status(200).json({ status: 'waiting' });
      return;
    }

    var chosen = pool.slice(0, 3);

    // 선택된 세 답변을 매칭 완료로 표시
    for (var i = 0; i < chosen.length; i++) {
      await fetch(SUPABASE_URL + '/rest/v1/answers?id=eq.' + chosen[i].id, {
        method: 'PATCH',
        headers: sbHeaders(),
        body: JSON.stringify({ matched: true })
      });
    }

    // 매칭된 작성자들에게 "세 사람이 모였어요" 이메일 (best-effort)
    var userIds = chosen.map(function (c) { return c.user_id; });
    var users = await getUsersByIds(userIds);
    var usersById = {};
    users.forEach(function (u) { usersById[u.id] = u; });

    for (var j = 0; j < users.length; j++) {
      await sendEmail(
        users[j].email,
        'Write-Read — 세 사람이 모였어요',
        '<p>' + (users[j].nickname || '당신') + '님, 오늘의 질문에 세 사람이 모였어요.<br/>누군가 당신의 답을 읽고, 편지를 보내올지도 몰라요. Write-Read에서 받은 편지함을 확인해보세요.</p>'
      );
    }

    var candidates = chosen.map(function (c) {
      var u = usersById[c.user_id];
      return { id: c.id, original: c.body, from: (u && u.nickname) ? u.nickname : '익명' };
    });

    res.status(200).json({ status: 'matched', candidates: candidates });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
