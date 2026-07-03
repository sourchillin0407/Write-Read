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

// 오늘(KST) 이미 첫 편지를 보냈는지 — 하루에 한 명에게만 보낼 수 있어요.
export async function hasSentLetterToday(meId) {
  var kstNow = new Date(Date.now() + 9 * 3600 * 1000);
  var startUTC = Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate()) - 9 * 3600 * 1000;
  var since = new Date(startUTC).toISOString();
  var r = await fetch(
    SUPABASE_URL + '/rest/v1/letters?from_user_id=eq.' + meId + '&created_at=gte.' + since + '&select=id&limit=1',
    { headers: sbHeaders() }
  );
  var rows = await r.json();
  return Array.isArray(rows) && rows.length > 0;
}

// 배열에서 n개를 랜덤으로 골라 chosen에 넣어요 (이미 들어있는 답은 제외).
function pickRandom(arr, n, chosen) {
  var taken = {};
  chosen.forEach(function (c) { taken[c.id] = 1; });
  var avail = arr.filter(function (a) { return !taken[a.id]; });
  for (var i = 0; i < n && avail.length; i++) {
    var idx = Math.floor(Math.random() * avail.length);
    chosen.push(avail[idx]);
    avail.splice(idx, 1);
  }
}

// 오늘 답한 사람들 중 펜팔 후보 3명을 골라요.
// 핵심: 답을 '소비'하지 않아요(재사용) → 그날 모든 답이 여러 사람에게 여러 번 뜰 수 있어요.
//  - 내가 고른 결(같은/다른)을 우선하되, 같은 결이 3명 미만이면 다른 결로 채워 3명을 만듭니다.
//  - 내 작성 시각과 '가까운 둘 + 먼 하나'를 뽑되 각 그룹 안에서 랜덤 → 매번 다르게, 결과적으로 랜덤하게 보임.
//  - 이미 내가 편지를 보낸 답은 제외.
//  - 3명 미만이면 null(대기).
export async function selectCandidates(meId, answerDate, myTone) {
  // 내 답의 작성 시각 (시간 가중치 기준)
  var meRes = await fetch(
    SUPABASE_URL + '/rest/v1/answers?user_id=eq.' + meId +
      '&answer_date=eq.' + encodeURIComponent(answerDate) + '&select=created_at&limit=1',
    { headers: sbHeaders() }
  );
  var meRows = await meRes.json();
  var myTime = (meRows[0] && meRows[0].created_at) ? new Date(meRows[0].created_at).getTime() : Date.now();

  // 그날 나 외의 모든 답 (소비하지 않으므로 matched 조건 없음)
  var poolRes = await fetch(
    SUPABASE_URL + '/rest/v1/answers?answer_date=eq.' + encodeURIComponent(answerDate) +
      '&user_id=neq.' + meId + '&select=id,body,user_id,tone,created_at',
    { headers: sbHeaders() }
  );
  var pool = await poolRes.json();
  if (!Array.isArray(pool)) return { status: 'waiting', count: 0 };

  // 이미 내가 편지를 보낸 답은 제외 (같은 사람에게 또 첫 편지 X)
  var sentRes = await fetch(
    SUPABASE_URL + '/rest/v1/letters?from_user_id=eq.' + meId + '&select=to_answer_id',
    { headers: sbHeaders() }
  );
  var sent = await sentRes.json();
  var sentSet = {};
  (Array.isArray(sent) ? sent : []).forEach(function (s) { if (s.to_answer_id) sentSet[s.to_answer_id] = 1; });
  pool = pool.filter(function (a) { return !sentSet[a.id]; });

  // 3명이 안 모였으면 대기 — 지금까지 모인 인원 수를 함께 알려줘요
  if (pool.length < 3) return { status: 'waiting', count: pool.length };

  // 결 우선: 같은 결이 3명 이상이면 같은 결에서, 아니면 전체에서
  var same = pool.filter(function (a) { return a.tone === myTone; });
  var base = (same.length >= 3) ? same : pool;

  // 작성 시각 거리로 정렬 → 가까운 절반 / 먼 절반
  base = base.slice().sort(function (a, b) {
    return Math.abs(new Date(a.created_at).getTime() - myTime) - Math.abs(new Date(b.created_at).getTime() - myTime);
  });
  var half = Math.max(Math.ceil(base.length / 2), 2);
  var near = base.slice(0, half);
  var far = base.slice(half);
  if (far.length === 0) far = near;

  // 가까운 데서 2, 먼 데서 1 (각 그룹 랜덤). 모자라면 전체에서 채워 3명.
  var chosen = [];
  pickRandom(near, 2, chosen);
  pickRandom(far, 1, chosen);
  if (chosen.length < 3) pickRandom(base, 3 - chosen.length, chosen);
  chosen = chosen.slice(0, 3);

  // 닉네임/언어 붙이기
  var users = await getUsersByIds(chosen.map(function (c) { return c.user_id; }));
  var byId = {};
  users.forEach(function (u) { byId[u.id] = u; });

  return {
    status: 'matched',
    candidates: chosen.map(function (c) {
      var u = byId[c.user_id];
      return {
        id: c.id,
        original: c.body,
        from: (u && u.nickname) ? u.nickname : '익명',
        lang: (u && u.lang) ? u.lang : null
      };
    })
  };
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
