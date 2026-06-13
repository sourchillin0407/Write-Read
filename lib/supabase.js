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
