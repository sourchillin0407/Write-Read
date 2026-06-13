// 첫 편지 보내기 — Vercel 서버리스 함수
import { sendEmail } from '../lib/resend.js';
import { SUPABASE_URL, sbHeaders, getUserByEmail, getUsersByIds } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    var body = req.body || {};
    var email = body.email;
    var toAnswerId = body.toAnswerId;
    var text = body.body;

    if (!email || !toAnswerId || !text) {
      res.status(400).json({ error: 'missing fields' });
      return;
    }

    var sender = await getUserByEmail(email);
    if (!sender) {
      res.status(404).json({ error: 'user not found' });
      return;
    }

    // 받는 사람의 user_id 조회
    var answerRes = await fetch(
      SUPABASE_URL + '/rest/v1/answers?id=eq.' + toAnswerId + '&select=user_id',
      { headers: sbHeaders() }
    );
    var answerRows = await answerRes.json();
    var toAnswer = answerRows[0];
    if (!toAnswer) {
      res.status(404).json({ error: 'answer not found' });
      return;
    }

    var insertRes = await fetch(SUPABASE_URL + '/rest/v1/letters', {
      method: 'POST',
      headers: sbHeaders(),
      body: JSON.stringify({
        from_user_id: sender.id,
        to_user_id: toAnswer.user_id,
        to_answer_id: toAnswerId,
        body: text
      })
    });
    if (!insertRes.ok) {
      var errText = await insertRes.text();
      res.status(502).json({ error: errText });
      return;
    }

    // 받는 사람에게 "새 편지가 도착했어요" 이메일 (best-effort)
    var recipients = await getUsersByIds([toAnswer.user_id]);
    if (recipients[0]) {
      await sendEmail(
        recipients[0].email,
        'Write-Read — 새 편지가 도착했어요',
        '<p>' + (recipients[0].nickname || '당신') + '님, 누군가 당신에게 편지를 보냈어요.<br/>Write-Read 받은 편지함에서 확인해보세요.</p>'
      );
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
