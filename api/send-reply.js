// 답장 보내기 — Vercel 서버리스 함수
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
    var letterId = body.letterId;
    var text = body.body;

    if (!email || !letterId || !text) {
      res.status(400).json({ error: 'missing fields' });
      return;
    }

    var sender = await getUserByEmail(email);
    if (!sender) {
      res.status(404).json({ error: 'user not found' });
      return;
    }

    // 원래 편지를 보낸 사람 — 답장의 수신자
    var letterRes = await fetch(
      SUPABASE_URL + '/rest/v1/letters?id=eq.' + letterId + '&select=from_user_id',
      { headers: sbHeaders() }
    );
    var letterRows = await letterRes.json();
    var letter = letterRows[0];
    if (!letter) {
      res.status(404).json({ error: 'letter not found' });
      return;
    }

    var insertRes = await fetch(SUPABASE_URL + '/rest/v1/replies', {
      method: 'POST',
      headers: sbHeaders(),
      body: JSON.stringify({
        letter_id: letterId,
        from_user_id: sender.id,
        to_user_id: letter.from_user_id,
        body: text
      })
    });
    if (!insertRes.ok) {
      var errText = await insertRes.text();
      res.status(502).json({ error: errText });
      return;
    }

    // 받는 사람에게 "새 편지가 도착했어요" 이메일 (best-effort)
    var recipients = await getUsersByIds([letter.from_user_id]);
    if (recipients[0]) {
      await sendEmail(
        recipients[0].email,
        'Write-Read — 새 편지가 도착했어요',
        '<p>' + (recipients[0].nickname || '당신') + '님, 누군가 당신에게 답장을 보냈어요.<br/>Write-Read 받은 편지함에서 확인해보세요.</p>'
      );
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
