// Supabase REST API 공용 헬퍼 — service_role 키로 RLS를 우회해요
// SUPABASE_SERVICE_ROLE_KEY는 Vercel 환경변수에 저장돼요 (코드에는 절대 적지 않아요)
export var SUPABASE_URL = 'https://kkjcbazvgrxqzgfbzbcs.supabase.co';

export function sbHeaders(extra) {
  var key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  var headers = {
    'apikey': key,
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json'
  };
  if (extra) {
    for (var k in extra) headers[k] = extra[k];
  }
  return headers;
}

export async function getUserByEmail(email) {
  var r = await fetch(
    SUPABASE_URL + '/rest/v1/users?email=eq.' + encodeURIComponent(email) + '&select=id,nickname,email',
    { headers: sbHeaders() }
  );
  var rows = await r.json();
  return rows[0];
}

export async function getUsersByIds(ids) {
  if (!ids.length) return [];
  var r = await fetch(
    SUPABASE_URL + '/rest/v1/users?id=in.(' + ids.join(',') + ')&select=id,nickname,email',
    { headers: sbHeaders() }
  );
  return r.json();
}

export async function getUserById(id) {
  var r = await fetch(
    SUPABASE_URL + '/rest/v1/users?id=eq.' + encodeURIComponent(id) + '&select=id,nickname,email,lang',
    { headers: sbHeaders() }
  );
  var rows = await r.json();
  return rows[0];
}

// 최근 1분 동안 이 사람이 보낸 편지+답장 개수 (스팸 방지용)
export async function countRecentSends(userId) {
  var since = new Date(Date.now() - 60 * 1000).toISOString();
  var query = '&from_user_id=eq.' + userId + '&created_at=gte.' + since + '&select=id';
  var [lettersRes, repliesRes] = await Promise.all([
    fetch(SUPABASE_URL + '/rest/v1/letters?' + query.slice(1), { headers: sbHeaders() }),
    fetch(SUPABASE_URL + '/rest/v1/replies?' + query.slice(1), { headers: sbHeaders() })
  ]);
  var letters = await lettersRes.json();
  var replies = await repliesRes.json();
  return letters.length + replies.length;
}

// 요청에 담긴 출입증(access_token)으로 "진짜 로그인한 사용자"를 확인합니다.
// 클라이언트가 보내는 이메일을 믿지 않고, 토큰을 Supabase에 직접 검증해요.
// 토큰이 없거나 위조/만료면 null을 돌려줘서, 호출한 쪽에서 401로 막습니다.
export async function getAuthedUser(req) {
  var raw = req.headers['authorization'] || req.headers['Authorization'];
  if (!raw) return null;
  var token = raw.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  var key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  var r = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { 'apikey': key, 'Authorization': 'Bearer ' + token }
  });
  if (!r.ok) return null;
  var authUser = await r.json();
  if (!authUser || !authUser.id) return null;

  // 닉네임 등 프로필은 users 테이블에서 (없으면 토큰 정보로 최소 구성)
  var profile = await getUserById(authUser.id);
  return profile || { id: authUser.id, email: authUser.email, nickname: null };
}
