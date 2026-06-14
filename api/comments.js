// 지도 편지의 댓글 목록 — Vercel 서버리스 함수
// 공개 벽이라 로그인 없이도 읽을 수 있어요.
import { SUPABASE_URL, sbHeaders } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    var letterId = String((req.query && req.query.letterId) || '').trim();
    if (!letterId) {
      res.status(400).json({ error: 'letterId required' });
      return;
    }

    var r = await fetch(
      SUPABASE_URL + '/rest/v1/letter_comments' +
        '?public_letter_id=eq.' + encodeURIComponent(letterId) +
        '&select=nickname,lang,body,created_at&order=created_at.asc&limit=200',
      { headers: sbHeaders() }
    );
    var comments = await r.json();
    res.status(200).json({ comments: Array.isArray(comments) ? comments : [] });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
