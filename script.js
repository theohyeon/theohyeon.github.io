/**
 * Google Style Startpage JavaScript
 * - Weather Forecast (Seoul, Jeju) via Open-Meteo API
 * - Google Search Engine Integration & Voice Search
 * - Inspirational Quotes Collection & Clipboard Copy
 * - Realtime Clock & Date
 * - Dark Mode Toggle (with LocalStorage)
 * - Google Apps Menu Toggle
 */

document.addEventListener("DOMContentLoaded", () => {
  initClock();
  initWeather();
  initSearch();
  initQuotes();
  initTheme();
  initAppsMenu();
});

/* ===================================================
   1. Realtime Clock & Date
   =================================================== */
function initClock() {
  const timeEl = document.getElementById("current-time");
  const dateEl = document.getElementById("current-date");

  const daysKo = ["일", "월", "화", "수", "목", "금", "토"];

  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    if (timeEl) {
      timeEl.textContent = `${hours}:${minutes}:${seconds}`;
    }

    if (dateEl) {
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const date = now.getDate();
      const day = daysKo[now.getDay()];
      dateEl.textContent = `${year}. ${month}. ${date} (${day})`;
    }
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/* ===================================================
   2. Weather Forecast (Seoul & Jeju) via Open-Meteo
   =================================================== */
const CITIES = {
  seoul: {
    name: "서울",
    lat: 37.5665,
    lon: 126.9780,
    tempEl: document.getElementById("seoul-temp"),
    iconEl: document.getElementById("seoul-icon"),
    descEl: document.getElementById("seoul-desc"),
    apparentEl: document.getElementById("seoul-apparent"),
    humidityEl: document.getElementById("seoul-humidity")
  },
  jeju: {
    name: "제주",
    lat: 33.4996,
    lon: 126.5312,
    tempEl: document.getElementById("jeju-temp"),
    iconEl: document.getElementById("jeju-icon"),
    descEl: document.getElementById("jeju-desc"),
    apparentEl: document.getElementById("jeju-apparent"),
    humidityEl: document.getElementById("jeju-humidity")
  }
};

/**
 * WMO Weather interpretation codes (WW)
 */
function interpretWmoCode(code, isDay = 1) {
  switch (code) {
    case 0:
      return { desc: "맑음", icon: isDay ? "☀️" : "🌙" };
    case 1:
      return { desc: "대체로 맑음", icon: isDay ? "🌤️" : "🌤️" };
    case 2:
      return { desc: "구름 조금", icon: isDay ? "⛅" : "☁️" };
    case 3:
      return { desc: "흐림", icon: "☁️" };
    case 45:
    case 48:
      return { desc: "안개", icon: "🌫️" };
    case 51:
    case 53:
    case 55:
      return { desc: "이슬비", icon: "🌦️" };
    case 61:
    case 63:
    case 65:
      return { desc: "비", icon: "🌧️" };
    case 66:
    case 67:
      return { desc: "진눈깨비", icon: "🌨️" };
    case 71:
    case 73:
    case 75:
      return { desc: "눈", icon: "❄️" };
    case 77:
      return { desc: "싸락눈", icon: "🌨️" };
    case 80:
    case 81:
    case 82:
      return { desc: "소나기", icon: "🌦️" };
    case 85:
    case 86:
      return { desc: "눈 소나기", icon: "🌨️" };
    case 95:
    case 96:
    case 99:
      return { desc: "뇌우", icon: "⛈️" };
    default:
      return { desc: "구름", icon: "⛅" };
  }
}

async function fetchWeather(cityKey) {
  const city = CITIES[cityKey];
  if (!city) return;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code&timezone=Asia%2FSeoul`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();
    const current = data.current;

    const weatherInfo = interpretWmoCode(current.weather_code, current.is_day);
    const temp = Math.round(current.temperature_2m);
    const apparent = Math.round(current.apparent_temperature);
    const humidity = current.relative_humidity_2m;

    if (city.tempEl) city.tempEl.textContent = `${temp}°`;
    if (city.iconEl) city.iconEl.textContent = weatherInfo.icon;
    if (city.descEl) city.descEl.textContent = weatherInfo.desc;
    if (city.apparentEl) city.apparentEl.textContent = `체감 ${apparent}°`;
    if (city.humidityEl) city.humidityEl.textContent = `습도 ${humidity}%`;
  } catch (err) {
    console.warn(`Weather fetch failed for ${city.name}:`, err);
    // Fallback UI
    if (city.tempEl) city.tempEl.textContent = "18°";
    if (city.iconEl) city.iconEl.textContent = "🌤️";
    if (city.descEl) city.descEl.textContent = "대체로 맑음";
    if (city.apparentEl) city.apparentEl.textContent = "체감 17°";
    if (city.humidityEl) city.humidityEl.textContent = "습도 50%";
  }
}

function loadAllWeather() {
  fetchWeather("seoul");
  fetchWeather("jeju");
}

function initWeather() {
  loadAllWeather();

  const refreshBtn = document.getElementById("weather-refresh");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      refreshBtn.style.transform = "rotate(360deg)";
      setTimeout(() => {
        refreshBtn.style.transform = "";
      }, 500);

      loadAllWeather();
      showToast("날씨 정보를 최신으로 갱신했습니다 🌤️");
    });
  }

  // 카드 클릭 시 갱신
  document.getElementById("weather-seoul")?.addEventListener("click", () => {
    fetchWeather("seoul");
    showToast("서울 날씨 갱신 완료 📍");
  });
  document.getElementById("weather-jeju")?.addEventListener("click", () => {
    fetchWeather("jeju");
    showToast("제주 날씨 갱신 완료 🏝️");
  });

  // 15분마다 자동 갱신
  setInterval(loadAllWeather, 15 * 60 * 1000);
}

/* ===================================================
   3. Search Engine & Input Controls
   =================================================== */
function initSearch() {
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const clearBtn = document.getElementById("clear-btn");
  const voiceBtn = document.getElementById("voice-btn");

  // 검색어 입력 시 삭제(X) 버튼 토글
  searchInput.addEventListener("input", () => {
    if (searchInput.value.trim().length > 0) {
      clearBtn.classList.add("visible");
    } else {
      clearBtn.classList.remove("visible");
    }
  });

  // 삭제 버튼 클릭 시 입력값 초기화 및 포커스
  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.classList.remove("visible");
    searchInput.focus();
  });

  // 검색 제출 핸들러 (구글 검색 실행)
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) {
      searchInput.focus();
      return;
    }

    // URL 직접 입력 패턴 감지 (예: https://... 또는 naver.com)
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
    if (urlPattern.test(query) && !query.includes(" ")) {
      const targetUrl = query.startsWith("http://") || query.startsWith("https://")
        ? query
        : `https://${query}`;
      window.location.href = targetUrl;
      return;
    }

    // 구글 검색으로 이동
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.location.href = googleSearchUrl;
  });

  // 음성 검색 (Web Speech API)
  if (voiceBtn) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "ko-KR";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      let isListening = false;

      voiceBtn.addEventListener("click", () => {
        if (!isListening) {
          try {
            recognition.start();
            isListening = true;
            voiceBtn.classList.add("listening");
            showToast("음성을 듣고 있습니다. 말씀해 주세요 🎙️");
          } catch (e) {
            console.error(e);
          }
        } else {
          recognition.stop();
          isListening = false;
          voiceBtn.classList.remove("listening");
        }
      });

      recognition.onresult = (event) => {
        const speechText = event.results[0][0].transcript;
        searchInput.value = speechText;
        clearBtn.classList.add("visible");
        showToast(`인식됨: "${speechText}" 🔎`);
        // 바로 검색 실행
        setTimeout(() => {
          searchForm.dispatchEvent(new Event("submit"));
        }, 500);
      };

      recognition.onspeechend = () => {
        recognition.stop();
        isListening = false;
        voiceBtn.classList.remove("listening");
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        isListening = false;
        voiceBtn.classList.remove("listening");
        showToast("음성 인식 오류가 발생했습니다.");
      };
    } else {
      voiceBtn.addEventListener("click", () => {
        showToast("현재 브라우저는 음성 인식을 지원하지 않습니다.");
      });
    }
  }
}

/* ===================================================
   4. Inspirational Quotes Collection & Logic
   =================================================== */
const QUOTES = [
  { text: "시작이 반이다.", author: "아리스토텔레스" },
  { text: "길을 알고 걷는 것과 그 길을 걷는 것은 다르다.", author: "영화 <매트릭스>" },
  { text: "어제와 똑같이 살면서 다른 미래를 기대하는 것은 어리석은 일이다.", author: "알베르트 아인슈타인" },
  { text: "우리가 두려워해야 할 유일한 것은 두려움 그 자체다.", author: "프랭클린 D. 루스벨트" },
  { text: "꿈을 이룰 수 있는 가장 좋은 방법은 깨어나는 것이다.", author: "폴 발레리" },
  { text: "바람이 불지 않을 때 바람개비를 돌리는 방법은 앞으로 달려가는 것이다.", author: "데일 카네기" },
  { text: "지금 당신이 있는 자리에서, 가진 것으로, 할 수 있는 것을 하라.", author: "시어도어 루스벨트" },
  { text: "천 리 길도 한 걸음부터.", author: "노자" },
  { text: "당신이 할 수 있다고 믿든 할 수 없다고 믿든, 당신이 옳다.", author: "헨리 포드" },
  { text: "성공의 비결은 결코 포기하지 않는 끈기에 있다.", author: "벤저민 디즈레일리" },
  { text: "가장 큰 영광은 결코 넘어지지 않는 것이 아니라 넘어질 때마다 일어서는 데 있다.", author: "공자" },
  { text: "미래는 오늘 당신이 무엇을 하느냐에 달려 있다.", author: "마하트마 간디" },
  { text: "배움에는 끝이 없다. 질문을 멈추지 마라.", author: "알베르트 아인슈타인" },
  { text: "행복은 목적지가 아니라 살아가는 여정이다.", author: "틱낫한" },
  { text: "승리는 가장 끈기 있는 자에게 돌아간다.", author: "나폴레옹 보나파르트" },
  { text: "지혜로운 사람은 행동으로 증명하고, 어리석은 사람은 말로만 설명한다.", author: "탈무드" },
  { text: "스스로를 신뢰하라. 그러면 어떻게 살아야 할지 알게 될 것이다.", author: "요한 볼프강 폰 괴테" },
  { text: "새벽이 오기 직전이 언제나 가장 어둡다.", author: "토마스 풀러" },
  { text: "실패는 다시 시작할 수 있는 기회다. 이번에는 더 현명하게.", author: "헨리 포드" },
  { text: "단 하나의 작은 생각이 당신의 온 세상을 바꿀 수 있다.", author: "마르쿠스 아우렐리우스" },
  { text: "오늘 걷지 않으면 내일은 뛰어야 한다.", author: "카를레스 푸욜" },
  { text: "노력은 결코 배신하지 않는다.", author: "이승엽" },
  { text: "작은 일에 충실한 것이 위대한 성취의 시작이다.", author: "마더 테레사" },
  { text: "과거에 얽매이지 말고, 미래를 두려워하지 말며, 오직 지금 이 순간에 집중하라.", author: "스토아 철학" },
  { text: "모든 벽은 문이 될 수 있다.", author: "랄프 왈도 에머슨" }
];

let currentQuoteIndex = -1;

function displayQuote(index, animated = true) {
  const quoteTextEl = document.getElementById("quote-text");
  const quoteAuthorEl = document.getElementById("quote-author");

  const quote = QUOTES[index];
  if (!quote || !quoteTextEl || !quoteAuthorEl) return;

  if (animated) {
    quoteTextEl.classList.add("fade");
    quoteAuthorEl.classList.add("fade");

    setTimeout(() => {
      quoteTextEl.textContent = `“${quote.text}”`;
      quoteAuthorEl.textContent = `- ${quote.author}`;
      quoteTextEl.classList.remove("fade");
      quoteAuthorEl.classList.remove("fade");
    }, 200);
  } else {
    quoteTextEl.textContent = `“${quote.text}”`;
    quoteAuthorEl.textContent = `- ${quote.author}`;
  }
}

function getRandomQuoteIndex() {
  if (QUOTES.length <= 1) return 0;
  let nextIndex;
  do {
    nextIndex = Math.floor(Math.random() * QUOTES.length);
  } while (nextIndex === currentQuoteIndex);
  return nextIndex;
}

function initQuotes() {
  currentQuoteIndex = getRandomQuoteIndex();
  displayQuote(currentQuoteIndex, false);

  const newQuoteBtn = document.getElementById("new-quote-btn");
  const copyQuoteBtn = document.getElementById("copy-quote-btn");
  const luckyBtn = document.getElementById("lucky-btn");

  if (newQuoteBtn) {
    newQuoteBtn.addEventListener("click", () => {
      currentQuoteIndex = getRandomQuoteIndex();
      displayQuote(currentQuoteIndex, true);
    });
  }

  if (luckyBtn) {
    luckyBtn.addEventListener("click", () => {
      currentQuoteIndex = getRandomQuoteIndex();
      displayQuote(currentQuoteIndex, true);
      // 명언 카드로 부드럽게 스크롤
      document.querySelector(".quote-card-container")?.scrollIntoView({ behavior: "smooth", block: "center" });
      showToast("새로운 오늘의 명언을 불러왔습니다 ✨");
    });
  }

  if (copyQuoteBtn) {
    copyQuoteBtn.addEventListener("click", async () => {
      const currentQuote = QUOTES[currentQuoteIndex];
      if (!currentQuote) return;

      const copyContent = `"${currentQuote.text}" - ${currentQuote.author}`;
      try {
        await navigator.clipboard.writeText(copyContent);
        showToast("명언이 클립보드에 복사되었습니다 📋");
      } catch (err) {
        // Fallback copy
        const tempTextArea = document.createElement("textarea");
        tempTextArea.value = copyContent;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand("copy");
        document.body.removeChild(tempTextArea);
        showToast("명언이 클립보드에 복사되었습니다 📋");
      }
    });
  }
}

/* ===================================================
   5. Dark / Light Theme Toggle
   =================================================== */
function initTheme() {
  const themeToggle = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("startpage_theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  } else if (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.body.classList.add("dark-mode");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const isDark = document.body.classList.contains("dark-mode");
      localStorage.setItem("startpage_theme", isDark ? "dark" : "light");
      showToast(isDark ? "다크 모드가 적용되었습니다 🌙" : "라이트 모드가 적용되었습니다 ☀️");
    });
  }
}

/* ===================================================
   6. Google Apps Dropdown Menu Toggle
   =================================================== */
function initAppsMenu() {
  const appsBtn = document.getElementById("apps-btn");
  const appsMenu = document.getElementById("apps-menu");

  if (!appsBtn || !appsMenu) return;

  appsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    appsMenu.classList.toggle("active");
  });

  // 바깥 영역 클릭 시 닫기
  document.addEventListener("click", (e) => {
    if (!appsMenu.contains(e.target) && e.target !== appsBtn) {
      appsMenu.classList.remove("active");
    }
  });
}

/* ===================================================
   7. Toast Notification Utility
   =================================================== */
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}
