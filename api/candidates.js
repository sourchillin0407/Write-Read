// 오늘의 펜팔 후보 다시 조회 — Vercel 서버리스 함수
// 답을 쓰고 나갔다가 다시 들어왔을 때, 그날 모인 사람들 중 후보를 보여주기 위해 사용해요.
import { SUPABASE_URL, sbHeaders, getAuthedUser, selectCandidates } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    var user = await getAuthedUser(req);
    if (!user) {
      res.status(401).json({ error: 'login required' });
      return;
    }

    var date = String((req.query && req.query.date) || '').trim();
    if (!date) {
      res.status(400).json({ error: 'date required' });
      return;
    }

    // 내 답(과 결)이 있어야 후보를 골라줄 수 있어요
    var r = await fetch(
      SUPABASE_URL + '/rest/v1/answers?user_id=eq.' + user.id +
        '&answer_date=eq.' + encodeURIComponent(date) + '&select=tone&limit=1',
      { headers: sbHeaders() }
    );
    var rows = await r.json();
    if (!rows[0]) {
      res.status(200).json({ status: 'none' }); // 아직 오늘 답을 안 썼어요
      return;
    }

    var result = await selectCandidates(user.id, date, rows[0].tone);
    if (!result || result.status !== 'matched') {
      res.status(200).json({ status: 'waiting', count: result ? result.count : 0 });
      return;
    }

    res.status(200).json({ status: 'matched', candidates: result.candidates });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
