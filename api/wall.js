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
        '&select=id,nickname,lang,body,place,lat,lng,created_at&order=created_at.desc&limit=500',
      { headers: sbHeaders() }
    );
    var letters = await r.json();
    if (!Array.isArray(letters)) letters = [];

    // 편지별 댓글 수 세기 (letter_comments 테이블이 아직 없으면 그냥 0)
    if (letters.length) {
      var ids = letters.map(function (l) { return l.id; });
      var cRes = await fetch(
        SUPABASE_URL + '/rest/v1/letter_comments?public_letter_id=in.(' + ids.join(',') + ')&select=public_letter_id',
        { headers: sbHeaders() }
      );
      var comments = await cRes.json();
      var counts = {};
      if (Array.isArray(comments)) {
        comments.forEach(function (c) { counts[c.public_letter_id] = (counts[c.public_letter_id] || 0) + 1; });
      }
      letters.forEach(function (l) { l.commentCount = counts[l.id] || 0; });
    }

    res.status(200).json({ letters: letters });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
