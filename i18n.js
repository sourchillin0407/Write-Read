// 다국어(i18n) — 프로필에서 고른 언어대로 화면 글자를 바꿔요.
// 지금은 한국어(ko)·영어(en)를 완성했고, 그 외 언어를 고르면 영어로 보여줘요(폴백).
// 나중에 번역엔진을 붙이면 나머지 언어의 UI도 같은 방식으로 채울 수 있어요.
//
// 쓰는 법:
//   - 고정된 글자: HTML 요소에 data-i18n="키"  (placeholder는 data-i18n-ph, aria-label은 data-i18n-aria)
//   - JS에서 만드는 글자: t('키') 또는 t('키', { 이름: 값 })  ← {이름} 자리를 값으로 바꿔줘요
//   - 이 파일은 auth.js 다음에 불러오세요.

var I18N = {
  ko: {
    // 하단 독(공통)
    'nav.question': '오늘의 질문',
    'nav.inbox': '받은 편지함',
    'nav.unsent': '보내지 않은 편지',
    'nav.map': '지도',
    'nav.profile': '프로필',

    // 오늘의 질문 화면
    'q.hint': '다 적었다면, 엔터.',
    'q.hint.answered': '오늘 답했어요. 고치거나 그대로 두고 엔터를 누르면 보낼 사람을 골라요.',
    'q.hint.sentToday': '오늘은 편지를 보냈어요. 내일 또 만나요. (내용은 고쳐서 저장할 수 있어요)',
    'q.cand.oneADay': '하루에 편지는 한 명에게만 보낼 수 있어요.',
    'q.onePerDay': '오늘은 이미 한 통을 보냈어요. 내일 또 만나요.',
    'q.saving': '저장하는 중…',
    'q.saved': '고쳐서 저장했어요.',
    'q.saveFail': '저장하지 못했어요. 잠시 후 다시 시도해주세요.',
    'q.tone.ask': '이 답을, 누구에게 보낼까요.',
    'q.tone.same': '나와 같은 결의 사람에게',
    'q.tone.diff': '나와 다른 결의 사람에게',
    'q.lead.same': '당신과 비슷한 온도로 답한 세 사람입니다.',
    'q.lead.diff': '당신과 전혀 다른 곳에서 답한 세 사람입니다.',
    'q.write.lead': '이 사람에게, 첫 문장을 건네보세요.',
    'q.write.send': '띄워 보내기',
    'q.sending': '보내는 중…',
    'q.sendFail': '문제가 생겼어요. 잠시 후 다시 시도해주세요.',
    'q.connFail': '연결할 수 없어요. 잠시 후 다시 시도해주세요.',
    'q.wait.line': '아직, 사람이 모이는 중이에요.',
    'q.wait.sub': '당신의 답은 잘 놓아두었어요.<br/>잠시 후 다시 들어오면, 만날 사람들을 보여드릴게요.',
    'q.sent.line': '편지가 떠났어요.<br/>이제 당신이 할 일은, 기다리는 일뿐이에요.',
    'q.sent.sub': '오늘의 질문은 자정에 닫혀요. 당신의 답은 그때까지 누군가에게 흘러갑니다.',
    'q.home': '처음으로',
    'q.cand.lead': '오늘, 같은 질문에 답한 사람들이에요. 마음이 가는 답에 편지를 건네보세요.',
    'q.reenter': '오늘 함께한 사람들에게 편지 쓰기',
    'q.wait.hint': '아직 사람이 모이는 중이에요. 잠시 후 다시 들어오면 후보를 보여드릴게요.',

    // 프로필 화면
    'profile.name': '당신은 지금, {nick}(이)라는 이름으로 머물고 있어요.',
    'profile.noName': '이름 없는 사람',
    'profile.mail': '{mail} — 로그인에만 쓰는 주소예요. 새 편지는 받은 편지함에서 확인해요.',
    'profile.lang': '도착하는 편지는 {lang}로 번역되어 닿아요.',
    'profile.nickPlaceholder': '이름 혹은 별명',
    'profile.save': '저장하기',
    'profile.edit': '수정하기',
    'profile.leave': '이 이름을 두고 나가기',

    // 로그인 / 가입 화면
    'auth.email': '이메일 주소',
    'auth.password': '비밀번호',
    'auth.signup': '시작하기',
    'auth.login': '들어가기',
    'auth.toLogin': '이미 계정이 있어요 — 로그인',
    'auth.toSignup': '처음이신가요 — 가입하기',
    'auth.already': '이미 가입된 이메일이에요. 로그인해주세요.',
    'auth.needNick': '이름 혹은 별명을 적어주세요.',
    'auth.needBoth': '이메일과 비밀번호를 모두 채워주세요.',
    'auth.pwShort': '비밀번호는 6자 이상으로 적어주세요.',
    'auth.creating': '계정을 만드는 중…',
    'auth.entering': '들어가는 중…',
    'auth.signupFail': '가입에 실패했어요. 잠시 후 다시 시도해주세요.',
    'auth.loginFail': '이메일 또는 비밀번호를 확인해주세요.',
    'auth.connFail': '연결할 수 없어요. 잠시 후 다시 시도해주세요.',
    'auth.langNote': '가입 후 프로필에서 다른 언어로 바꿀 수 있어요.',

    // 받은 편지함
    'inbox.empty': '아직, 도착한 편지가 없어요.',
    'inbox.emptySub': '누군가에게 답이 닿으면, 여기로 편지가 와요.',
    'inbox.lead': '도착한 편지들이에요.',
    'inbox.fromLetter': '{from}님이 보낸 편지',
    'inbox.fromReply': '{from}님이 보낸 답장',
    'inbox.replyToggle': '답장하기',
    'inbox.replyPlaceholder': '답장을 적어보세요',
    'inbox.replySend': '보내기',
    'inbox.sending': '보내는 중…',
    'inbox.sent': '답장을 보냈어요.',
    'inbox.sendFail': '문제가 생겼어요. 잠시 후 다시 시도해주세요.',
    'inbox.connFail': '연결할 수 없어요. 잠시 후 다시 시도해주세요.',
    'inbox.back': '대화 목록',
    'inbox.origin': '이 답에서 시작된 대화예요.',
    'inbox.replyHint': '답장을 적어보세요',
    'inbox.yourTurn': '답장할 차례예요',
    'inbox.waiting': '답장을 보냈어요. 상대의 답을 기다리는 중이에요.',

    // 보내지 않은 편지
    'unsent.title': '보내지 않은 편지',
    'unsent.sub': '부치지 않아도, 편지는 편지니까요.<br/>여기 적어 보관하고, 지도에 공개하면 3일 동안 전 세계 누구나 볼 수 있어요.',
    'unsent.new': '새로 적기',
    'unsent.keep': '서랍에 담아두기',
    'unsent.onMap': '지도 위에 있어요',
    'unsent.inDrawer': '서랍 속에 있어요',
    'unsent.collect': '거두기',
    'unsent.placeOnMap': '지도에 공개하기',
    'unsent.delete': '지우기',
    'unsent.published': '지도에 공개됨 · {days}일 남음',
    'unsent.expired': '공개가 끝나 서랍으로 돌아왔어요',
    'unsent.placingHint': '지도에서 둘 자리를 정해주세요.',

    // 지도
    'map.title': '떠도는 편지들',
    'map.sub': '공개된 편지는, 그 편지가 놓인 자리에서 누구나 주울 수 있어요.',
    'map.placingMsg': '이 편지를 둘 곳의 주소나 장소 이름을 적어주세요.',
    'map.placeholder': '예: 서울 성수동, Shibuya, Montmartre',
    'map.search': '자리 찾기',
    'map.here': '아니면 — 지금 내가 있는 자리에 두기',
    'map.gotoMe': '내가 있는 곳으로',
    'map.myLetter': '— 나의 편지',
    'map.searching': '자리를 찾고 있어요…',
    'map.confirmMany': '여기인가요?',
    'map.confirmOne': '여기인가요? 맞다면 눌러주세요.',
    'map.notFound': '그곳을 찾지 못했어요. 조금 다르게 적어볼까요?',
    'map.noLocPlace': '위치를 가져올 수 없었어요. 주소를 적어서 자리를 정해주세요.',
    'map.noLocAlert': '위치를 가져올 수 없었어요. 브라우저의 위치 권한을 확인해주세요.'
  },

  en: {
    'nav.question': "Today's question",
    'nav.inbox': 'Inbox',
    'nav.unsent': 'Unsent letters',
    'nav.map': 'Map',
    'nav.profile': 'Profile',

    'q.hint': "When you're done, press Enter.",
    'q.hint.answered': "You answered today. Edit it or leave it, then press Enter to choose who to write to.",
    'q.hint.sentToday': "You've sent your letter today. See you tomorrow. (You can still edit and save your answer.)",
    'q.cand.oneADay': 'You can send one letter a day, to one person.',
    'q.onePerDay': "You've already sent one today. See you tomorrow.",
    'q.saving': 'Saving…',
    'q.saved': 'Saved your changes.',
    'q.saveFail': "Couldn't save. Please try again in a moment.",
    'q.tone.ask': 'Who should this answer go to?',
    'q.tone.same': 'To someone who feels like me',
    'q.tone.diff': 'To someone unlike me',
    'q.lead.same': 'Three people who answered at a temperature like yours.',
    'q.lead.diff': 'Three people who answered from somewhere entirely different.',
    'q.write.lead': 'Offer this person your first sentence.',
    'q.write.send': 'Send it off',
    'q.sending': 'Sending…',
    'q.sendFail': 'Something went wrong. Please try again in a moment.',
    'q.connFail': "Couldn't connect. Please try again in a moment.",
    'q.wait.line': 'People are still gathering.',
    'q.wait.sub': "Your answer is safely set aside.<br/>Come back in a little while and we'll show you who to meet.",
    'q.sent.line': 'Your letter has set off.<br/>Now all that is left is to wait.',
    'q.sent.sub': "Today's question closes at midnight. Until then, your answer drifts toward someone.",
    'q.home': 'Back to start',
    'q.cand.lead': "People who answered today's question. Offer a letter to the answer that speaks to you.",
    'q.reenter': "Write to today's answerers",
    'q.wait.hint': "People are still gathering. Come back in a bit and we'll show you who you can write to.",

    'profile.name': "You're here as {nick} right now.",
    'profile.noName': 'Someone with no name',
    'profile.mail': '{mail} — used only to log in. New letters appear in your inbox.',
    'profile.lang': 'Incoming letters reach you translated into {lang}.',
    'profile.nickPlaceholder': 'Name or nickname',
    'profile.save': 'Save',
    'profile.edit': 'Edit',
    'profile.leave': 'Leave this name behind',

    // Login / sign-up
    'auth.email': 'Email address',
    'auth.password': 'Password',
    'auth.signup': 'Get started',
    'auth.login': 'Enter',
    'auth.toLogin': 'Already have an account — Log in',
    'auth.toSignup': 'First time here — Sign up',
    'auth.already': 'This email is already registered. Please log in.',
    'auth.needNick': 'Please enter a name or nickname.',
    'auth.needBoth': 'Please fill in both email and password.',
    'auth.pwShort': 'Password must be at least 6 characters.',
    'auth.creating': 'Creating your account…',
    'auth.entering': 'Entering…',
    'auth.signupFail': 'Sign-up failed. Please try again in a moment.',
    'auth.loginFail': 'Please check your email or password.',
    'auth.connFail': "Couldn't connect. Please try again in a moment.",
    'auth.langNote': 'You can switch languages in your profile after signing up.',

    // Inbox
    'inbox.empty': 'No letters have arrived yet.',
    'inbox.emptySub': 'When your answer reaches someone, a letter will come here.',
    'inbox.lead': 'The letters that have arrived.',
    'inbox.fromLetter': 'A letter from {from}',
    'inbox.fromReply': 'A reply from {from}',
    'inbox.replyToggle': 'Reply',
    'inbox.replyPlaceholder': 'Write your reply',
    'inbox.replySend': 'Send',
    'inbox.sending': 'Sending…',
    'inbox.sent': 'Your reply has been sent.',
    'inbox.sendFail': 'Something went wrong. Please try again in a moment.',
    'inbox.connFail': "Couldn't connect. Please try again in a moment.",
    'inbox.back': 'Conversations',
    'inbox.origin': 'This conversation began from this answer.',
    'inbox.replyHint': 'Write your reply',
    'inbox.yourTurn': 'Your turn to reply',
    'inbox.waiting': 'Sent. Waiting for their reply.',

    // Unsent letters
    'unsent.title': 'Unsent letters',
    'unsent.sub': 'A letter is a letter, even unsent.<br/>Keep it here, or place it on the map — shared with the world for 3 days.',
    'unsent.new': 'Write a new one',
    'unsent.keep': 'Tuck it in the drawer',
    'unsent.onMap': 'On the map',
    'unsent.inDrawer': 'In the drawer',
    'unsent.collect': 'Take it back',
    'unsent.placeOnMap': 'Place on the map',
    'unsent.delete': 'Delete',
    'unsent.published': 'On the map · {days} days left',
    'unsent.expired': 'Sharing ended — back in the drawer',
    'unsent.placingHint': 'Pick a spot on the map.',

    // Map
    'map.title': 'Drifting letters',
    'map.sub': 'A shared letter can be picked up by anyone, right where it was placed.',
    'map.placingMsg': 'Enter an address or place name for where to leave this letter.',
    'map.placeholder': 'e.g. Seongsu Seoul, Shibuya, Montmartre',
    'map.search': 'Find the spot',
    'map.here': 'Or — leave it where I am right now',
    'map.gotoMe': 'Go to where I am',
    'map.myLetter': '— my letter',
    'map.searching': 'Looking for the spot…',
    'map.confirmMany': 'Is it one of these?',
    'map.confirmOne': 'Is this it? Tap to confirm.',
    'map.notFound': "Couldn't find that place. Try writing it a little differently?",
    'map.noLocPlace': "Couldn't get your location. Enter an address to set the spot.",
    'map.noLocAlert': "Couldn't get your location. Check your browser's location permission."
  }
};

// 화면 언어 결정: 프로필에서 저장한 wr_lang. 없으면 한국어.
// 사전이 아직 없는 언어(영어 외)는 영어로 폴백해요.
function uiLang() {
  var l = localStorage.getItem('wr_lang') || 'ko';
  return I18N[l] ? l : 'en';
}

// 키로 글자를 가져와요. params가 있으면 {이름} 자리를 바꿔줘요.
function t(key, params) {
  var dict = I18N[uiLang()] || I18N.en;
  var s = (dict && dict[key] != null) ? dict[key]
        : (I18N.en[key] != null ? I18N.en[key] : key);
  if (params) {
    Object.keys(params).forEach(function (k) {
      s = s.split('{' + k + '}').join(params[k]);
    });
  }
  return s;
}

// 언어 코드 → 사람이 읽는 이름 (지도/후보 카드에서 "어떤 언어를 쓰는 사람"인지 표시)
var LANG_NAMES = {
  ko: '한국어', en: 'English', ja: '日本語', zh: '中文(简体)', zht: '中文(繁體)',
  es: 'Español', fr: 'Français', de: 'Deutsch', pt: 'Português', it: 'Italiano',
  ru: 'Русский', ar: 'العربية', hi: 'हिन्दी', bn: 'বাংলা', id: 'Bahasa Indonesia',
  vi: 'Tiếng Việt', th: 'ไทย', tr: 'Türkçe', pl: 'Polski', nl: 'Nederlands',
  sv: 'Svenska', uk: 'Українська', el: 'Ελληνικά', cs: 'Čeština', ro: 'Română',
  hu: 'Magyar', fi: 'Suomi', da: 'Dansk', no: 'Norsk', he: 'עברית',
  fa: 'فارسی', ms: 'Bahasa Melayu', fil: 'Filipino', sw: 'Kiswahili'
};
function langLabel(code) {
  return (code && LANG_NAMES[code]) ? LANG_NAMES[code] : (code || '');
}

// 두 언어를 함께 보여줘요 (첫 화면처럼 방문자의 언어를 아직 모를 때).
// 한국어 / English 형태로 합쳐서 돌려줘요 (두 값이 같으면 하나만).
function tBoth(key, params) {
  var a = I18N.ko[key] != null ? I18N.ko[key] : key;
  var b = I18N.en[key] != null ? I18N.en[key] : key;
  if (params) {
    Object.keys(params).forEach(function (k) {
      a = a.split('{' + k + '}').join(params[k]);
      b = b.split('{' + k + '}').join(params[k]);
    });
  }
  return (a === b) ? a : (a + ' / ' + b);
}

// data-i18n* 속성이 붙은 요소들의 글자를 현재 언어로 교체해요.
function applyI18n(root) {
  root = root || document;
  document.documentElement.lang = uiLang();
  root.querySelectorAll('[data-i18n]').forEach(function (el) {
    el.innerHTML = t(el.getAttribute('data-i18n'));
  });
  root.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
  });
  root.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
  });
}

// 첫 화면 칠하기 (이 스크립트는 마크업 다음에 로드되므로 요소들이 이미 있어요)
applyI18n();

// 로그인한 사용자의 저장된 언어를 확인해서, localStorage와 다르면 갱신 후 다시 칠해요.
// (다른 기기에서 처음 들어와 localStorage가 비어있는 경우를 위해)
if (window.sb && sb.auth && typeof sb.auth.getUser === 'function') {
  sb.auth.getUser().then(function (res) {
    var u = res && res.data ? res.data.user : null;
    var lang = u && u.user_metadata ? u.user_metadata.lang : null;
    if (lang && lang !== localStorage.getItem('wr_lang')) {
      localStorage.setItem('wr_lang', lang);
      applyI18n();
      // 페이지가 JS로 만든 동적 글자(질문 본문 등)도 다시 그릴 수 있게 알림
      document.dispatchEvent(new Event('i18n:changed'));
    }
  }).catch(function () {});
}
