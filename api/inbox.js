// 받은 편지함 조회 — Vercel 서버리스 함수
import { SUPABASE_URL, sbHeaders, getAuthedUser, getUsersByIds } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // 출입증으로 본인 확인 — 남의 받은 편지함은 절대 못 열어요
    var user = await getAuthedUser(req);
    if (!user) {
      res.status(401).json({ error: 'login required' });
      return;
    }

    var lettersRes = await fetch(
      SUPABASE_URL + '/rest/v1/letters?to_user_id=eq.' + user.id +
        '&select=id,body,from_user_id,created_at&order=created_at.desc',
      { headers: sbHeaders() }
    );
    var letters = await lettersRes.json();

    var repliesRes = await fetch(
      SUPABASE_URL + '/rest/v1/replies?to_user_id=eq.' + user.id +
        '&select=id,letter_id,body,from_user_id,created_at&order=created_at.desc',
      { headers: sbHeaders() }
    );
    var replies = await repliesRes.json();

    var fromIds = letters.map(function (l) { return l.from_user_id; })
      .concat(replies.map(function (r) { return r.from_user_id; }));
    var uniqueFromIds = fromIds.filter(function (id, idx) { return fromIds.indexOf(id) === idx; });
    var senders = await getUsersByIds(uniqueFromIds);
    var sendersById = {};
    senders.forEach(function (s) { sendersById[s.id] = s; });

    var messages = letters.map(function (l) {
      var s = sendersById[l.from_user_id];
      return {
        kind: 'letter',
        id: l.id,
        letterId: l.id,
        from: (s && s.nickname) ? s.nickname : '익명',
        body: l.body,
        createdAt: l.created_at
      };
    }).concat(replies.map(function (r) {
      var s = sendersById[r.from_user_id];
      return {
        kind: 'reply',
        id: r.id,
        letterId: r.letter_id,
        from: (s && s.nickname) ? s.nickname : '익명',
        body: r.body,
        createdAt: r.created_at
      };
    }));

    messages.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });

    res.status(200).json({ messages: messages });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
