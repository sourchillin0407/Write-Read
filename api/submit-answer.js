// 오늘의 답변 저장 + 펜팔 후보 선택 — Vercel 서버리스 함수
// 답을 '소비'하지 않아요(재사용). 후보 선택은 lib의 selectCandidates가 담당.
import { SUPABASE_URL, sbHeaders, getAuthedUser, selectCandidates } from '../lib/supabase.js';

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
    var text = String(body.body || '').trim();
    // editOnly: 이미 오늘 답한 사람이 "내용만 고칠 때". 후보 조회를 건너뜁니다.
    var editOnly = body.editOnly === true;

    if (questionIndex == null || !answerDate || !tone || !text || text.length > 1000) {
      res.status(400).json({ error: 'invalid body' });
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

    // 수정 모드면 여기서 끝
    if (editOnly) {
      res.status(200).json({ status: 'saved' });
      return;
    }

    // 오늘 답한 사람들 중 펜팔 후보 3명 (답을 소비하지 않으므로 다음 사람에게도 또 뜰 수 있어요)
    var result = await selectCandidates(user.id, answerDate, tone);
    if (!result || result.status !== 'matched') {
      // 아직 3명이 안 모였어요 — 지금까지 모인 인원 수를 함께 알려줘요.
      res.status(200).json({ status: 'waiting', count: result ? result.count : 0 });
      return;
    }

    res.status(200).json({ status: 'matched', candidates: result.candidates });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
