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

// ── 하단 독(공통 꾸미기): 아이콘 아래 작은 라벨 + 받은 편지함 '답장할 차례' 알림 점
// 모든 페이지가 auth.js를 쓰므로 여기 한 곳에서 처리해요.

// 아이콘 아래 라벨 — 이미 번역된 aria-label 글자를 그대로 보여줘요
function paintDockLabels() {
  var dock = document.querySelector('.dock');
  if (!dock) return;
  dock.querySelectorAll('a').forEach(function (a) {
    var span = a.querySelector('.dock-label');
    if (!span) {
      span = document.createElement('span');
      span.className = 'dock-label';
      a.appendChild(span);
    }
    span.textContent = a.getAttribute('aria-label') || '';
  });
}

// 받은 편지함에 '내가 답장할 차례'인 대화가 있으면 편지함 아이콘에 점을 켜요
async function checkInboxBadge() {
  var link = document.querySelector('.dock a[href="inbox.html"]');
  if (!link || link.querySelector('.dock-dot')) return;
  try {
    var token = await getAccessToken();
    if (!token) return;
    var res = await apiFetch('/api/inbox');
    var data = await res.json();
    var myTurn = ((data && data.threads) || []).some(function (th) { return th.canReply; });
    if (myTurn) {
      var dot = document.createElement('span');
      dot.className = 'dock-dot';
      link.appendChild(dot);
    }
  } catch (e) {}
}

(function initDock() {
  function run() {
    if (!document.querySelector('.dock')) return;
    // 라벨·점 스타일 (페이지 CSS를 건드리지 않고 여기서 주입)
    var css = document.createElement('style');
    css.textContent =
      '.dock a { flex-direction: column; align-items: center; gap: 4px; position: relative; text-decoration: none; }' +
      '.dock .dock-label { font-size: 10px; letter-spacing: 0.05em; color: var(--point); opacity: 0.85; }' +
      '.dock .dock-dot { position: absolute; top: -3px; right: 2px; width: 8px; height: 8px; border-radius: 50%; background: #c0574f; }';
    document.head.appendChild(css);
    paintDockLabels();
    document.addEventListener('i18n:changed', paintDockLabels); // 언어 바뀌면 라벨도 갈아끼워요
    checkInboxBadge();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
