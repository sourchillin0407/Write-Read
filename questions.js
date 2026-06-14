// 오늘의 질문 — 60일치, 자정(한국 시간)마다 자동으로 순환됩니다. (v3)
// QUESTIONS_START 날짜를 0번 질문(#1)으로 보고, 하루씩 다음 질문으로 넘어가요.
// 60일이 지나면 다시 0번부터 반복됩니다.

var QUESTIONS = [
  "요즘 가장 자주 듣는 노래는 무엇인가요.",
  "좋아하는 가수나 밴드가 있다면 누구인가요.",
  "요즘 자주 가는 맛집이 있다면 이름과 동네를 알려주세요.",
  "혼자 먹기 좋은 음식이나 식당을 추천한다면.",
  "오늘 먹은 것 중 가장 기억나는 한 입은 무엇인가요.",
  "최근에 본 영화나 드라마 중 괜찮았던 것이 있나요.",
  "요즘 즐겨 보는 유튜브 채널이나 콘텐츠가 있나요.",
  "최근에 읽은 책이나 글 중 추천하고 싶은 것이 있나요.",
  "당신의 하루는 보통 어떤 소리로 시작하나요.",
  "처음엔 별로였는데 점점 좋아진 음식, 노래, 장소가 있나요.",
  "좋아하는 카페가 있다면, 그곳에서 주로 무엇을 주문하나요.",
  "비 오는 날 어울리는 노래나 음식이 있다면.",
  "지금 책상이나 주변에 놓여 있는 것 중 하나를 골라 소개해주세요.",
  "요즘 자주 쓰는 앱이나 웹사이트가 있나요.",
  "누군가에게 추천하고 싶지만, 막상 추천하기는 조금 망설여지는 것이 있나요.",
  "당신이 사는 동네에서 좋아하는 산책길이나 장소가 있나요.",
  "편의점이나 마트에서 자주 사는 음식이 있나요.",
  "오늘 본 하늘은 어떤 색에 가까웠나요.",
  "기분이 좋지 않을 때 찾게 되는 음식이나 음료가 있나요.",
  "요즘 당신을 조금 웃게 하는 작은 일이 있나요.",
  "다시 가고 싶은 여행지가 있다면 어디인가요.",
  "여행 가면 꼭 사는 물건이나 먹는 음식이 있나요.",
  "당신만 알고 싶은 장소가 있다면 어떤 곳인가요.",
  "자기 전에 자주 하는 습관이 있나요.",
  "요즘 반복해서 듣는 가수의 곡 중 하나만 고른다면.",
  "좋아하는 계절 음식이 있다면 무엇인가요.",
  "오늘 길에서 본 것 중 기억에 남는 장면이 있나요.",
  "친구에게 가볍게 추천하고 싶은 노래 한 곡이 있다면.",
  "좋아하지만 남에게 설명하면 조금 이상해질 것 같은 취향이 있나요.",
  "최근에 산 것 중 마음에 드는 물건이 있나요.",
  "아침에 먹기 좋은 음식이나 음료를 추천한다면.",
  "오늘 하루 중 가장 조용했던 순간은 언제였나요.",
  "별 기대 없이 갔다가 의외로 좋았던 장소가 있나요.",
  "누군가에게 선물하기 좋은 작은 물건을 추천한다면.",
  "요즘 가장 자주 떠오르는 사람이나 장면이 있나요.",
  "운동할 때 듣기 좋은 노래나 플레이리스트가 있나요.",
  "집에 돌아왔을 때 가장 먼저 하는 일은 무엇인가요.",
  "당신의 동네를 처음 온 사람에게 추천할 만한 가게가 있나요.",
  "자주 가지만 사람들에게는 잘 말하지 않는 장소가 있나요.",
  "요즘 자주 찾아보는 키워드나 관심사가 있나요.",
  "밤에 듣기 좋은 노래를 하나 추천한다면.",
  "오늘 당신이 가장 오래 손에 들고 있었던 것은 무엇인가요.",
  "다시 보고 싶은 영화의 한 장면이 있다면.",
  "좋아하는데도 자주 피하게 되는 것이 있나요.",
  "당신이 사는 곳에서 외지인은 잘 모를 만한 음식을 추천한다면.",
  "혼자 있을 때 자주 하는 사소한 행동이 있나요.",
  "오늘 하루를 노래 제목처럼 붙인다면 무엇인가요.",
  "최근에 누군가에게 추천받고 좋았던 것이 있나요.",
  "맛은 평범한데 이상하게 계속 가게 되는 식당이나 카페가 있나요.",
  "당신의 플레이리스트에서 가장 오래 살아남은 노래는 무엇인가요.",
  "지금 창밖이나 주변에는 무엇이 보이나요.",
  "요즘 먹고 싶은 음식이 있다면 무엇인가요.",
  "남들은 별로라는데 당신은 좋아하는 음식이나 장소가 있나요.",
  "휴일에 가볍게 하기 좋은 일을 추천한다면.",
  "요즘의 당신에게 필요한 것은 휴식, 변화, 재미 중 무엇인가요.",
  "누군가 같은 노래를 세 번 반복해서 들었습니다. 무슨 일이 있었을까요.",
  "한 사람이 식당 앞에서 한참을 서 있다가 그냥 돌아갔습니다. 왜였을까요.",
  "이름 없는 편지가 도착했습니다. 첫 문장은 무엇이었을까요.",
  "누군가 물어봐주면 의외로 길게 말할 수 있는 주제가 있나요.",
  "오늘 누군가에게 하나만 추천할 수 있다면, 무엇을 추천하고 싶나요."
];

// 같은 질문의 영어 번역 (UI 언어가 영어(또는 한국어 외)일 때 보여줘요)
var QUESTIONS_EN = [
  "What song do you listen to most these days?",
  "A singer or band you like?",
  "A place you eat at often lately — its name and neighborhood?",
  "A food or restaurant you'd recommend for eating alone?",
  "What was the most memorable bite you had today?",
  "A film or show you watched recently and liked?",
  "A YouTube channel or content you enjoy these days?",
  "A book or article you've read recently that you'd recommend?",
  "What sound usually begins your day?",
  "A food, song, or place you disliked at first but grew to like?",
  "A café you like — what do you usually order there?",
  "A song or food that fits a rainy day?",
  "Pick one thing on your desk or nearby and introduce it.",
  "An app or website you use often these days?",
  "Something you'd like to recommend, but hesitate to?",
  "A walking route or spot you like in your neighborhood?",
  "Something you often buy at a convenience store or supermarket?",
  "What color was the sky you saw today?",
  "A food or drink you turn to when you feel low?",
  "A small thing that makes you smile these days?",
  "A place you'd like to travel to again?",
  "Something you always buy or eat when you travel?",
  "A place you'd like to keep to yourself?",
  "Something you often do before sleeping?",
  "If you had to pick one song by an artist you keep listening to lately?",
  "A seasonal food you love?",
  "A scene from the street today that stayed with you?",
  "One song you'd casually recommend to a friend?",
  "A taste you love but find hard to explain without sounding strange?",
  "Something you've bought recently that you like?",
  "A food or drink you'd recommend for the morning?",
  "What was the quietest moment of your day?",
  "A place you visited without expectations but unexpectedly liked?",
  "A small gift you'd recommend giving to someone?",
  "A person or scene that comes to mind often these days?",
  "A song or playlist that's good for exercising?",
  "What's the first thing you do when you get home?",
  "A shop you'd recommend to someone visiting your neighborhood for the first time?",
  "A place you often go but don't usually tell people about?",
  "A keyword or topic you look up often these days?",
  "One song you'd recommend for nighttime?",
  "What did you hold in your hands the longest today?",
  "A movie scene you'd like to watch again?",
  "Something you like but often avoid?",
  "A local food visitors might not know but you'd recommend?",
  "A small thing you often do when you're alone?",
  "If today had a song-title-like name, what would it be?",
  "Something someone recommended to you recently that you liked?",
  "A restaurant or café that's ordinary but somehow keeps pulling you back?",
  "What song has stayed in your playlist the longest?",
  "What do you see outside your window or around you right now?",
  "What food have you been craving lately?",
  "A food or place others don't like much, but you do?",
  "Something light you'd recommend doing on a day off?",
  "What do you need most these days: rest, change, or fun?",
  "Someone listened to the same song three times in a row. What happened?",
  "Someone stood in front of a restaurant for a long time, then walked away. Why?",
  "An unsigned letter arrived. What was the first line?",
  "A topic you could talk about for a long time if someone asked?",
  "If you could recommend just one thing to someone today, what would it be?"
];

var QUESTIONS_START = '2026-06-13'; // 이 날이 0번 질문(#1) → 다음 날(06-14)이 #2

function todayQuestionIndex() {
  // 시작일을 'KST 달력 날짜' 그대로 UTC 기준점으로 (오늘 계산과 기준을 맞춰요)
  var p = QUESTIONS_START.split('-');
  var startUTC = Date.UTC(+p[0], +p[1] - 1, +p[2]);
  var kstNow = new Date(Date.now() + 9 * 3600 * 1000);
  var nowUTC = Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate());
  var days = Math.floor((nowUTC - startUTC) / 86400000);
  return ((days % QUESTIONS.length) + QUESTIONS.length) % QUESTIONS.length;
}

// UI 언어에 맞는 오늘의 질문. 한국어면 한국어, 그 외(영어 등)면 영어로.
function todayQuestion() {
  return questionByIndex(todayQuestionIndex());
}

// 특정 번호의 질문을 현재 언어로 (받은 편지함에서 "어떤 질문에 답한 사람"을 보여줄 때 사용)
function questionByIndex(idx) {
  var lang = (typeof uiLang === 'function') ? uiLang() : 'ko';
  var arr = (lang === 'ko') ? QUESTIONS : QUESTIONS_EN;
  return (arr[idx] != null) ? arr[idx] : '';
}

// KST 기준 오늘 날짜 (YYYY-MM-DD)
function todayDateString() {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}
