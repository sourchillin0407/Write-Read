// 지도에 공개된 편지들(전 세계 공유) — Vercel 서버리스 함수
// 공개된 지 3일 이내인 것만 돌려줘요. 로그인 없이도 볼 수 있어요(공개 벽).
import { SUPABASE_URL, sbHeaders } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    var since = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString();
    var r = await fetch(
      SUPABASE_URL + '/rest/v1/public_letters' +
        '?created_at=gte.' + since +
        '&select=nickname,lang,body,lat,lng,created_at&order=created_at.desc&limit=500',
      { headers: sbHeaders() }
    );
    var letters = await r.json();
    res.status(200).json({ letters: Array.isArray(letters) ? letters : [] });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
