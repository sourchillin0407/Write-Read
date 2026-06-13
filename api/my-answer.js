// 오늘 내가 쓴 답 조회 — Vercel 서버리스 함수
// 질문 화면을 다시 열어도, 오늘 이미 쓴 답을 그대로 보여주기 위해 사용해요.
import { SUPABASE_URL, sbHeaders, getAuthedUser, hasSentLetterToday } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // 출입증으로 본인 확인 — 남의 답은 못 봐요
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

    var r = await fetch(
      SUPABASE_URL + '/rest/v1/answers' +
        '?user_id=eq.' + user.id +
        '&answer_date=eq.' + encodeURIComponent(date) +
        '&select=body,tone,question_index,matched',
      { headers: sbHeaders() }
    );
    var rows = await r.json();
    var answer = (rows && rows[0]) ? rows[0] : null;

    // 오늘 이미 편지를 보냈으면, 질문 화면에서 안내하고 후보 고르기 흐름을 막아요
    var sentToday = await hasSentLetterToday(user.id);

    res.status(200).json({ answer: answer, sentToday: sentToday });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
