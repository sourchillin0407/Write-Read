// 답장 보내기 — Vercel 서버리스 함수
import { sendEmail } from '../lib/resend.js';
import { SUPABASE_URL, sbHeaders, getAuthedUser, getUsersByIds, countRecentSends } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // 출입증으로 보내는 사람 확인
    var sender = await getAuthedUser(req);
    if (!sender) {
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

    // 짧은 시간에 너무 많이 보내는 것 방지 (스팸 방지)
    if (await countRecentSends(sender.id) >= 5) {
      res.status(429).json({ error: 'too many requests' });
      return;
    }

    // 이 편지(대화)의 두 사람 확인
    var letterRes = await fetch(
      SUPABASE_URL + '/rest/v1/letters?id=eq.' + letterId + '&select=from_user_id,to_user_id',
      { headers: sbHeaders() }
    );
    var letterRows = await letterRes.json();
    var letter = letterRows[0];
    if (!letter) {
      res.status(404).json({ error: 'letter not found' });
      return;
    }

    // 이 대화의 두 사람 중 하나여야 답장할 수 있어요 (제3자 끼어들기 차단).
    // 누가 시작했든, 두 사람은 계속 번갈아 이어서 쓸 수 있어요.
    if (letter.from_user_id !== sender.id && letter.to_user_id !== sender.id) {
      res.status(403).json({ error: 'not your conversation' });
      return;
    }
    // 받는 사람은 "이 대화의 상대방"
    var recipientId = (letter.from_user_id === sender.id) ? letter.to_user_id : letter.from_user_id;

    // 펜팔 규칙: 가장 최근에 온 편지에만 1회 답장. 내가 마지막으로 보낸 상태면 못 보내요(상대 차례).
    var lastReplyRes = await fetch(
      SUPABASE_URL + '/rest/v1/replies?letter_id=eq.' + letterId + '&order=created_at.desc&limit=1&select=from_user_id',
      { headers: sbHeaders() }
    );
    var lastReplyRows = await lastReplyRes.json();
    var lastSender = lastReplyRows.length ? lastReplyRows[0].from_user_id : letter.from_user_id;
    if (lastSender === sender.id) {
      res.status(409).json({ error: 'wait for their reply' });
      return;
    }

    var insertRes = await fetch(SUPABASE_URL + '/rest/v1/replies', {
      method: 'POST',
      headers: sbHeaders(),
      body: JSON.stringify({
        letter_id: letterId,
        from_user_id: sender.id,
        to_user_id: recipientId,
        body: text
      })
    });
    if (!insertRes.ok) {
      var errText = await insertRes.text();
      res.status(502).json({ error: errText });
      return;
    }

    // 받는 사람에게 "새 편지가 도착했어요" 이메일 (best-effort)
    var recipients = await getUsersByIds([recipientId]);
    if (recipients[0]) {
      await sendEmail(
        recipients[0].email,
        'Dear — 새 편지가 도착했어요',
        '<p>' + (recipients[0].nickname || '당신') + '님, 누군가 당신에게 답장을 보냈어요.<br/>Dear 받은 편지함에서 확인해보세요.</p>'
      );
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
