// 받은 편지함 — 대화(스레드)별로 묶어서 돌려줘요. Vercel 서버리스 함수
// 한 통의 첫 편지(letter) + 거기 달린 답장(replies)들이 하나의 "대화"예요.
// 누가 시작했든 두 사람이 계속 주고받을 수 있어요.
import { SUPABASE_URL, sbHeaders, getAuthedUser, getUsersByIds } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // 출입증으로 본인 확인 — 남의 대화는 절대 못 봐요
    var user = await getAuthedUser(req);
    if (!user) {
      res.status(401).json({ error: 'login required' });
      return;
    }
    var me = user.id;

    // 내가 보냈거나 받은 편지(대화의 시작점)
    var lettersRes = await fetch(
      SUPABASE_URL + '/rest/v1/letters' +
        '?or=(from_user_id.eq.' + me + ',to_user_id.eq.' + me + ')' +
        '&select=id,from_user_id,to_user_id,to_answer_id,body,created_at&order=created_at.asc',
      { headers: sbHeaders() }
    );
    var letters = await lettersRes.json();
    if (!letters.length) {
      res.status(200).json({ threads: [] });
      return;
    }

    var letterIds = letters.map(function (l) { return l.id; });

    // 그 편지들에 달린 답장 전부 (양방향)
    var repliesRes = await fetch(
      SUPABASE_URL + '/rest/v1/replies' +
        '?letter_id=in.(' + letterIds.join(',') + ')' +
        '&select=letter_id,from_user_id,body,created_at&order=created_at.asc',
      { headers: sbHeaders() }
    );
    var replies = await repliesRes.json();

    // 대화의 "시작이 된 답변"(질문 번호 + 답 내용) 조회
    var answerIds = letters
      .map(function (l) { return l.to_answer_id; })
      .filter(Boolean);
    var answers = [];
    if (answerIds.length) {
      var ansRes = await fetch(
        SUPABASE_URL + '/rest/v1/answers?id=in.(' + answerIds.join(',') + ')&select=id,question_index,body',
        { headers: sbHeaders() }
      );
      answers = await ansRes.json();
    }
    var answerById = {};
    answers.forEach(function (a) { answerById[a.id] = a; });

    // 상대방 닉네임
    var otherIdSet = {};
    letters.forEach(function (l) {
      otherIdSet[l.from_user_id === me ? l.to_user_id : l.from_user_id] = 1;
    });
    var others = await getUsersByIds(Object.keys(otherIdSet));
    var nameById = {};
    others.forEach(function (u) { nameById[u.id] = u.nickname || '익명'; });

    // 답장을 편지별로 모아두기
    var repliesByLetter = {};
    replies.forEach(function (r) {
      (repliesByLetter[r.letter_id] = repliesByLetter[r.letter_id] || []).push(r);
    });

    // 대화(스레드) 만들기 — 편지 한 통 = 대화 하나.
    // 펜팔 방식: 보여주는 건 "상대가 나에게 보낸 편지"뿐. 내가 쓴 답장은 보이지 않아요.
    // canReply = 가장 최근 메시지가 상대에게서 온 것일 때(=내 차례)만 true → 1회 답장.
    var threads = letters.map(function (l) {
      var otherId = (l.from_user_id === me) ? l.to_user_id : l.from_user_id;
      var seed = answerById[l.to_answer_id];

      var all = [{ mine: l.from_user_id === me, body: l.body, createdAt: l.created_at }];
      (repliesByLetter[l.id] || []).forEach(function (r) {
        all.push({ mine: r.from_user_id === me, body: r.body, createdAt: r.created_at });
      });
      all.sort(function (a, b) { return new Date(a.createdAt) - new Date(b.createdAt); });

      var incoming = all.filter(function (m) { return !m.mine; })
        .map(function (m) { return { body: m.body, createdAt: m.createdAt }; });
      var last = all[all.length - 1];

      return {
        threadId: l.id,
        other: nameById[otherId] || '익명',
        questionIndex: seed ? seed.question_index : null,
        seedAnswer: seed ? seed.body : null,
        incoming: incoming,
        canReply: !last.mine,                 // 마지막이 상대 것이면 내 차례
        lastIncomingAt: incoming.length ? incoming[incoming.length - 1].createdAt : null
      };
    }).filter(function (t) {
      return t.incoming.length > 0;           // 받은 게 있어야 받은 편지함에 보여요
    });

    // 최근에 편지가 온 대화가 위로
    threads.sort(function (a, b) { return new Date(b.lastIncomingAt) - new Date(a.lastIncomingAt); });

    res.status(200).json({ threads: threads });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
