// 지도 편지에 댓글 달기 — Vercel 서버리스 함수
// 닉네임/언어는 로그인한 본인 프로필에서 가져와요(클라가 보낸 값 안 믿음).
import { SUPABASE_URL, sbHeaders, getAuthedUser } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    var user = await getAuthedUser(req);
    if (!user) {
      res.status(401).json({ error: 'login required' });
      return;
    }

    var body = req.body || {};
    var letterId = body.letterId;
    var text = String(body.body || '').trim();
    if (!letterId || !text || text.length > 1000) {
      res.status(400).json({ error: 'invalid body' });
      return;
    }

    var insRes = await fetch(SUPABASE_URL + '/rest/v1/letter_comments', {
      method: 'POST',
      headers: sbHeaders(),
      body: JSON.stringify({
        public_letter_id: letterId,
        user_id: user.id,
        nickname: user.nickname || null,
        lang: user.lang || null,
        body: text
      })
    });
    if (!insRes.ok) {
      var errText = await insRes.text();
      res.status(502).json({ error: errText });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
