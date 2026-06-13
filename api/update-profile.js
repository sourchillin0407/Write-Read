// 프로필(닉네임·언어) 수정 — Vercel 서버리스 함수
import { SUPABASE_URL, sbHeaders, getAuthedUser } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // 출입증으로 본인 확인 — 자기 프로필만 고칠 수 있어요
    var user = await getAuthedUser(req);
    if (!user) {
      res.status(401).json({ error: 'login required' });
      return;
    }

    var body = req.body || {};
    var nickname = (body.nickname || '').trim();
    var lang = (body.lang || '').trim();

    var patch = {};
    if (nickname) patch.nickname = nickname;
    if (lang) patch.lang = lang;
    if (!Object.keys(patch).length) {
      res.status(400).json({ error: 'nothing to update' });
      return;
    }

    var r = await fetch(SUPABASE_URL + '/rest/v1/users?id=eq.' + user.id, {
      method: 'PATCH',
      headers: sbHeaders(),
      body: JSON.stringify(patch)
    });
    if (!r.ok) {
      var errText = await r.text();
      res.status(502).json({ error: errText });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
