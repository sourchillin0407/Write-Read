// 지도에 공개한 편지 거두기 — Vercel 서버리스 함수
// 내 것만 지울 수 있어요 (user_id로 한 번 더 확인).
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

    var id = (req.body && req.body.id) || '';
    if (!id) {
      res.status(400).json({ error: 'id required' });
      return;
    }

    var del = await fetch(
      SUPABASE_URL + '/rest/v1/public_letters?id=eq.' + encodeURIComponent(id) + '&user_id=eq.' + user.id,
      { method: 'DELETE', headers: sbHeaders() }
    );
    if (!del.ok) {
      var errText = await del.text();
      res.status(502).json({ error: errText });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
