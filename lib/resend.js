// 이메일 발송 공용 헬퍼 — Resend REST API 사용
// RESEND_API_KEY는 Vercel 환경변수에 저장돼요 (코드에는 절대 적지 않아요)
export async function sendEmail(to, subject, html) {
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Dear <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html
      })
    });
  } catch (e) {
    // 메일 발송 실패는 본 동작에 영향을 주지 않아요 (best-effort)
  }
}
