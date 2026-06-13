// 공용 로그인/세션 헬퍼 — 모든 페이지가 이 파일을 불러 써요.
// (반드시 supabase-js 스크립트를 먼저 불러온 뒤에 로드해야 해요)
//
// 핵심: 로그인하면 Supabase가 "출입증(access_token)"을 발급해요.
// 우리 서버(API)는 이 출입증으로만 "이 사람이 진짜 이 계정 주인"임을 확인합니다.
// 그래서 남의 이메일을 안다고 해서 그 사람인 척 할 수 없어요.

var SUPABASE_URL = 'https://kkjcbazvgrxqzgfbzbcs.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtramNiYXp2Z3J4cXpnZmJ6YmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNzgyNTUsImV4cCI6MjA5Njg1NDI1NX0.C7cvDWeiYM4zCibQz7NK7zKJMZ59NLY7k4JYBfRPJIU';

// supabase-js 전역 객체에서 클라이언트를 만듭니다.
var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 지금 로그인된 세션의 출입증(access_token)을 가져옵니다.
// 만료됐으면 supabase-js가 알아서 새로 받아와요(자동 갱신).
async function getAccessToken() {
  var res = await sb.auth.getSession();
  var session = res && res.data ? res.data.session : null;
  return session ? session.access_token : null;
}

// 로그인 필수 페이지에서 맨 위에 호출하세요.
// 로그인 안 돼 있으면 첫 화면으로 돌려보내고 null을 반환합니다.
async function requireLogin() {
  var token = await getAccessToken();
  if (!token) { window.location.replace('index.html'); return null; }
  return token;
}

// 우리 API(/api/...)를 부를 때 이걸 쓰면, 출입증이 자동으로 붙어요.
async function apiFetch(path, opts) {
  opts = opts || {};
  var token = await getAccessToken();
  opts.headers = opts.headers || {};
  if (token) opts.headers['Authorization'] = 'Bearer ' + token;
  return fetch(path, opts);
}

// 로그아웃
async function signOutAndLeave() {
  try { await sb.auth.signOut(); } catch (e) {}
  localStorage.removeItem('wr_nickname');
  window.location.href = 'index.html';
}
