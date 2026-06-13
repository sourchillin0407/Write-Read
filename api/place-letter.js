// 보내지 않은 편지를 지도에 공개 — Vercel 서버리스 함수
// 닉네임/언어는 로그인한 본인 프로필에서 가져와요(클라가 보낸 값 안 믿음). 3일 뒤 wall에서 자동으로 사라져요.
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
    var text = String(body.body || '').trim();
    var lat = Number(body.lat);
    var lng = Number(body.lng);
    if (!text || text.length > 1000 || !isFinite(lat) || !isFinite(lng)) {
      res.status(400).json({ error: 'invalid body' });
      return;
    }

    var insRes = await fetch(SUPABASE_URL + '/rest/v1/public_letters', {
      method: 'POST',
      headers: sbHeaders({ 'Prefer': 'return=representation' }),
      body: JSON.stringify({
        user_id: user.id,
        nickname: user.nickname || null,
        lang: user.lang || null,
        body: text,
        lat: lat,
        lng: lng
      })
    });
    if (!insRes.ok) {
      var errText = await insRes.text();
      res.status(502).json({ error: errText });
      return;
    }
    var rows = await insRes.json();
    res.status(200).json({ ok: true, id: rows[0] ? rows[0].id : null });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
