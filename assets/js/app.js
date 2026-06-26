/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const STORAGE_KEY = "madrasati-arabic-unit-one-lesson-one-v1";

// Initial state structure
let state = {
  currentScreen: "home", // "home", "practice", "results"
  currentIndex: 0,
  answers: {},
  shownAnswers: {},
  ratings: {},
  mastery: {},
  expandedCards: { "q-01": true }, // Question 1 open by default
  theme: "light"
};

// Load saved state from localStorage
function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Merge with default state to prevent key issues on schema changes
      state = { ...state, ...parsed };
    } catch (e) {
      console.error("Error parsing saved state:", e);
    }
  }
}

// Save state to localStorage
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  applyTheme();
  renderApp();
  setupGlobalEvents();
});

// Setup modal behaviors & general screen elements
function setupGlobalEvents() {
  // Theme Toggle Button
  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", toggleTheme);
  }

  // Home logo click to return to home safely
  const brand = document.getElementById("nav-brand");
  if (brand) {
    brand.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo("home");
    });
  }

  // Confirm reset modal actions
  const btnCancelReset = document.getElementById("modal-cancel");
  const btnConfirmReset = document.getElementById("modal-confirm");
  const resetModal = document.getElementById("reset-modal");

  if (btnCancelReset && resetModal) {
    btnCancelReset.addEventListener("click", () => {
      resetModal.style.display = "none";
    });
  }

  if (btnConfirmReset && resetModal) {
    btnConfirmReset.addEventListener("click", () => {
      resetModal.style.display = "none";
      performReset();
    });
  }

  // Close modal clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === resetModal) {
      resetModal.style.display = "none";
    }
  });
}

// Switch Themes between Light & Dark
function applyTheme() {
  const html = document.documentElement;
  html.setAttribute("data-theme", state.theme);
  
  const themeIcon = document.getElementById("theme-icon");
  if (themeIcon) {
    // Lucide Sun/Moon dynamic SVG inside vanilla JS
    if (state.theme === "dark") {
      themeIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
      `;
    } else {
      themeIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
      `;
    }
  }
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  applyTheme();
  saveState();
}

// Screen Routing
function navigateTo(screen) {
  state.currentScreen = screen;
  saveState();
  renderApp();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Perform full state reset
function performReset() {
  state.answers = {};
  state.shownAnswers = {};
  state.ratings = {};
  state.mastery = {};
  state.currentIndex = 0;
  // Set question 1 open by default
  state.expandedCards = { "q-01": true };
  saveState();
  navigateTo("practice");
}

function promptReset() {
  const resetModal = document.getElementById("reset-modal");
  if (resetModal) {
    resetModal.style.display = "flex";
  } else {
    // Fallback if modal DOM isn't ready
    if (confirm("هل أنت متأكد من رغبتك في حذف جميع إجاباتك وبدء محاولة جديدة؟")) {
      performReset();
    }
  }
}

// Render dynamic elements according to active screen state
function renderApp() {
  const mainContent = document.getElementById("main-content");
  if (!mainContent) return;

  // Toggle Navbar back-to-home button visibility
  const navHomeBtn = document.getElementById("nav-home-btn");
  if (navHomeBtn) {
    if (state.currentScreen === "home") {
      navHomeBtn.style.display = "none";
    } else {
      navHomeBtn.style.display = "inline-flex";
    }
  }

  // Clear container
  mainContent.innerHTML = "";

  if (state.currentScreen === "home") {
    renderHomeScreen(mainContent);
  } else if (state.currentScreen === "practice") {
    renderPracticeScreen(mainContent);
  } else if (state.currentScreen === "results") {
    renderResultsScreen(mainContent);
  }
}

// 1. Home Screen Layout
function renderHomeScreen(container) {
  const answeredCount = Object.keys(state.answers).filter(q => state.answers[q].trim().length > 0).length;
  const totalQuestions = QUESTIONS.length;
  const hasHistory = answeredCount > 0;

  const homeHTML = `
    <div class="home-screen" id="home-screen">
      <div class="home-logo-container">
        <img class="home-logo" src="./assets/images/madrasati-logo.png" alt="منصة مدرسي" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%22140%22 viewBox=%220%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%235B2596%22/><text x=%2250%25%22 y=%2255%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22white%22 font-family=%22sans-serif%22 font-size=%2224%22 font-weight=%22bold%22>مدرسي</text></svg>'">
      </div>
      <h1 class="home-title">منصة مدرسي</h1>
      <p class="home-subtitle">الأسئلة الوزارية حول الاستفهام التصديقي والتصوري لقواعد اللغة العربية للصف السادس الإعدادي</p>
      
      <div class="home-steps-card">
        <h3 class="home-steps-title">طريقة العمل المختصرة في المنصة:</h3>
        <ul class="home-steps-list">
          <li>
            <span class="home-steps-num">١</span>
            <span>اكتب جوابك الشخصي كاملاً وبكل أمانة في الحقل المخصص.</span>
          </li>
          <li>
            <span class="home-steps-num">٢</span>
            <span>اضغط على زر (أظهر الجواب النموذجي) للمقارنة الدقيقة مع المصدر.</span>
          </li>
          <li>
            <span class="home-steps-num">٣</span>
            <span>قيّم جوابك يا بطل بموضوعية واختر الدرجة المناسبة (0 أو 5 أو 10).</span>
          </li>
          <li>
            <span class="home-steps-num">٤</span>
            <span>حدّد مستوى تمكنك من السؤال لمراجعة نقاط ضعفك لاحقاً بكل سهولة.</span>
          </li>
        </ul>
      </div>

      <div class="home-stats-preview">
        عدد الأسئلة الكلي في هذا التدريب: ${totalQuestions} سؤالاً وزارياً.
        ${hasHistory ? `<br><span style="color:var(--color-primary);">لقد أجبت على ${answeredCount} من أصل ${totalQuestions} سؤالاً سابقاً.</span>` : ""}
      </div>

      <div class="home-actions">
        ${hasHistory ? `
          <button class="btn btn-primary" id="btn-continue">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play"><polygon points="6 3 20 12 6 21 6 3"/></svg>
            متابعة التدريب الحالي
          </button>
          <button class="btn btn-secondary" id="btn-new-attempt">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            بدء محاولة جديدة تماماً
          </button>
        ` : `
          <button class="btn btn-primary" id="btn-start">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-graduation-cap"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M6 18.8 6 12"/><path d="M18 12v6.8a2 2 0 0 1-1.332 1.888L12 22"/></svg>
            ابدأ التدريب الآن
          </button>
        `}
      </div>
    </div>
  `;

  container.innerHTML = homeHTML;

  // Event Listeners for actions
  const btnStart = document.getElementById("btn-start");
  const btnContinue = document.getElementById("btn-continue");
  const btnNewAttempt = document.getElementById("btn-new-attempt");

  if (btnStart) {
    btnStart.addEventListener("click", () => navigateTo("practice"));
  }
  if (btnContinue) {
    btnContinue.addEventListener("click", () => navigateTo("practice"));
  }
  if (btnNewAttempt) {
    btnNewAttempt.addEventListener("click", () => {
      promptReset();
    });
  }
}

// 2. Practice Screen Layout
function renderPracticeScreen(container) {
  const totalQuestions = QUESTIONS.length;
  const currentQ = QUESTIONS[state.currentIndex];
  
  // Calculate general progress
  const answeredCount = QUESTIONS.filter(q => (state.answers[q.id] || "").trim().length > 0).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const practiceHTML = `
    <div class="practice-header">
      <div class="progress-container">
        <span class="progress-label">تقدمك في الحل: ${answeredCount} من ${totalQuestions} أسئلة</span>
        <span class="progress-label" style="color: var(--color-primary);">${progressPercent}%</span>
      </div>
      <div class="progress-bar-outer">
        <div class="progress-bar-inner" style="width: ${progressPercent}%;"></div>
      </div>
      
      <!-- Horizontal navigation rail of all questions -->
      <div class="question-navigator" id="nav-rail"></div>
    </div>

    <div class="questions-list" id="accordion-container"></div>

    <div class="bottom-nav">
      <button class="btn btn-secondary" id="btn-prev-q">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        السؤال السابق
      </button>

      <button class="btn btn-primary" id="btn-finish-practice">
        إنهاء التدريب وعرض النتيجة
      </button>

      <button class="btn btn-secondary" id="btn-next-q">
        السؤال التالي
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left"><path d="m12 19 7-7-7-7"/><path d="M5 12h14"/></svg>
      </button>
    </div>
  `;

  container.innerHTML = practiceHTML;

  // Render the horizontal navigation dots/cards
  renderNavigationRail();

  // Render the single accordion cards
  renderAccordionCards();

  // Button Action handlers
  const btnPrev = document.getElementById("btn-prev-q");
  const btnNext = document.getElementById("btn-next-q");
  const btnFinish = document.getElementById("btn-finish-practice");

  if (btnPrev) {
    btnPrev.disabled = state.currentIndex === 0;
    btnPrev.addEventListener("click", () => {
      if (state.currentIndex > 0) {
        setFocusedIndex(state.currentIndex - 1);
      }
    });
  }

  if (btnNext) {
    btnNext.disabled = state.currentIndex === totalQuestions - 1;
    btnNext.addEventListener("click", () => {
      if (state.currentIndex < totalQuestions - 1) {
        setFocusedIndex(state.currentIndex + 1);
      }
    });
  }

  if (btnFinish) {
    btnFinish.addEventListener("click", () => {
      navigateTo("results");
    });
  }
}

// Render the horizontal navigator dots
function renderNavigationRail() {
  const rail = document.getElementById("nav-rail");
  if (!rail) return;

  QUESTIONS.forEach((q, idx) => {
    const dot = document.createElement("div");
    dot.className = `nav-dot ${state.currentIndex === idx ? 'active' : ''} ${state.answers[q.id] ? 'answered' : ''}`;
    dot.textContent = idx + 1;
    dot.title = `سؤال ${idx + 1}`;
    
    dot.addEventListener("click", () => {
      setFocusedIndex(idx);
    });

    rail.appendChild(dot);
  });

  // Scroll active dot into view inside the horizontal rail
  const activeDot = rail.querySelector(".nav-dot.active");
  if (activeDot) {
    activeDot.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }
}

// Changes active question, collapses others, expands target, saves state
function setFocusedIndex(idx) {
  state.currentIndex = idx;
  
  // Collapse all questions first
  state.expandedCards = {};
  
  // Expand the active question card
  const targetQ = QUESTIONS[idx];
  state.expandedCards[targetQ.id] = true;

  saveState();
  renderApp();

  // Smoothly scroll active card into viewport
  setTimeout(() => {
    const activeCard = document.getElementById(`card-${targetQ.id}`);
    if (activeCard) {
      activeCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, 50);
}

// Render the Accordion list of all questions
function renderAccordionCards() {
  const container = document.getElementById("accordion-container");
  if (!container) return;

  QUESTIONS.forEach((q, idx) => {
    const isExpanded = !!state.expandedCards[q.id];
    const isAnswered = !!state.answers[q.id] && state.answers[q.id].trim().length > 0;
    const isShown = !!state.shownAnswers[q.id];
    const hasRating = state.ratings[q.id] !== undefined;
    const masteryStatus = state.mastery[q.id];

    // Build Status Badge text & CSS
    let statusText = "لم تتم الإجابة";
    let statusClass = "status-unanswered";

    if (hasRating) {
      statusText = "تم التقييم";
      statusClass = "status-rated";
    } else if (isShown) {
      statusText = "تم عرض الجواب";
      statusClass = "status-viewed";
    } else if (isAnswered) {
      statusText = "تمت الإجابة";
      statusClass = "status-answered";
    }

    // Mastery Badge on Header
    let masteryBadgeHTML = "";
    if (masteryStatus) {
      let mText = "";
      let mClass = "";
      if (masteryStatus === "high") {
        mText = "متمكن";
        mClass = "mastery-high";
      } else if (masteryStatus === "mid") {
        mText = "يحتاج مراجعة";
        mClass = "mastery-mid";
      } else if (masteryStatus === "low") {
        mText = "غير متمكن";
        mClass = "mastery-low";
      }
      masteryBadgeHTML = `<span class="mastery-badge ${mClass}">${mText}</span>`;
    }

    const card = document.createElement("div");
    card.id = `card-${q.id}`;
    card.className = `accordion-card ${isExpanded ? 'active' : ''}`;

    const questionSnippet = q.question.substring(0, 45).replace(/\n/g, " ") + (q.question.length > 45 ? "..." : "");

    // Accordion Card DOM layout
    card.innerHTML = `
      <div class="card-header" onclick="toggleCardCollapse('${q.id}', ${idx})">
        <div class="card-header-left">
          <span class="question-num-badge">${idx + 1}</span>
          <span class="question-preview-text">${questionSnippet}</span>
        </div>
        <div class="card-header-right">
          ${masteryBadgeHTML}
          <span class="status-badge ${statusClass}">${statusText}</span>
          <span class="collapse-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
          </span>
        </div>
      </div>

      <div class="card-body">
        <div class="badges-row">
          ${q.years ? `<span class="year-badge">${q.years}</span>` : ''}
        </div>

        <h3 class="question-text">${q.question}</h3>

        ${q.quranVerse ? `
          <div class="quran-container">
            <div class="quran-verse">${q.quranVerse}</div>
          </div>
        ` : ''}

        <div class="answer-input-container">
          <label class="answer-label" for="textarea-${q.id}">إجابتك الشخصية يا بطل:</label>
          <textarea 
            class="answer-textarea" 
            id="textarea-${q.id}" 
            placeholder="اكتب هنا إجابتك النحوية الكاملة قبل عرض الإجابة النموذجية..."
            ${isShown ? 'disabled' : ''}
          >${state.answers[q.id] || ""}</textarea>
        </div>

        <div class="submit-action-row">
          <button 
            class="btn btn-primary" 
            id="btn-show-${q.id}" 
            onclick="revealModelAnswer('${q.id}')"
            ${(!state.answers[q.id] || state.answers[q.id].trim().length === 0 || isShown) ? 'disabled' : ''}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
            تمت الإجابة — أظهر الجواب النموذجي
          </button>
        </div>

        <!-- Hidden Model Answer Section -->
        <div class="model-answer-section" id="model-${q.id}" style="${isShown ? 'display:block;' : 'display:none;'}">
          <h4 class="model-answer-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
            الجواب النموذجي من المصدر:
          </h4>
          <p class="model-answer-text">${q.modelAnswer}</p>
        </div>

        <!-- Hidden Self-Assessment Section -->
        <div class="evaluation-section" id="eval-${q.id}" style="${isShown ? 'display:block;' : 'display:none;'}">
          <h4 class="eval-title">قيّم جوابك يا بطل</h4>
          <p class="eval-subtitle">اختر الدرجة التي تراها مناسبة بعد مقارنة جوابك بالجواب النموذجي المطبوع في المصدر:</p>
          
          <div class="eval-buttons">
            <button 
              class="btn-eval ${state.ratings[q.id] === 0 ? 'selected-0' : ''}" 
              onclick="rateQuestion('${q.id}', 0)"
            >
              0 درجة
            </button>
            <button 
              class="btn-eval ${state.ratings[q.id] === 5 ? 'selected-5' : ''}" 
              onclick="rateQuestion('${q.id}', 5)"
            >
              5 درجات
            </button>
            <button 
              class="btn-eval ${state.ratings[q.id] === 10 ? 'selected-10' : ''}" 
              onclick="rateQuestion('${q.id}', 10)"
            >
              10 درجات
            </button>
          </div>

          <!-- Mastery Section -->
          <div class="mastery-section">
            <h4 class="mastery-title">مستوى تمكنك من هذا السؤال:</h4>
            <div class="mastery-buttons">
              <button 
                class="btn-mastery ${state.mastery[q.id] === 'high' ? 'selected-high' : ''}" 
                onclick="setMasteryStatus('${q.id}', 'high')"
              >
                متمكن من السؤال
              </button>
              <button 
                class="btn-mastery ${state.mastery[q.id] === 'mid' ? 'selected-mid' : ''}" 
                onclick="setMasteryStatus('${q.id}', 'mid')"
              >
                أحتاج إلى مراجعة الموضوع
              </button>
              <button 
                class="btn-mastery ${state.mastery[q.id] === 'low' ? 'selected-low' : ''}" 
                onclick="setMasteryStatus('${q.id}', 'low')"
              >
                غير متمكن
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    container.appendChild(card);

    // Setup Textarea typing event listener
    const textarea = card.querySelector(`.answer-textarea`);
    const btnShow = card.querySelector(`#btn-show-${q.id}`);

    if (textarea && btnShow) {
      textarea.addEventListener("input", (e) => {
        const val = e.target.value;
        state.answers[q.id] = val;
        saveState();

        // Enable or disable show model answer button
        if (val.trim().length > 0 && !state.shownAnswers[q.id]) {
          btnShow.disabled = false;
        } else {
          btnShow.disabled = true;
        }
      });
    }
  });
}

// Collapses / Expands Accordion cards manually
window.toggleCardCollapse = function(qId, idx) {
  const wasExpanded = !!state.expandedCards[qId];
  
  // Collapse others or not, the guidelines say: "يمكن للطالب فتح أو إغلاق أي سؤال دون فقدان الإجابة... الأول مفتوح افتراضيا"
  // Let's toggle this card's expansion state. We don't necessarily have to close other cards, which allows beautiful free exploration!
  if (wasExpanded) {
    delete state.expandedCards[qId];
  } else {
    state.expandedCards[qId] = true;
    state.currentIndex = idx; // update navigator focus index to this card
  }
  saveState();
  
  // Re-render only navbar dot focus and accordion classes instead of whole page rebuild to preserve scrolling position
  const allCards = document.querySelectorAll(".accordion-card");
  allCards.forEach(c => {
    const cid = c.id.replace("card-", "");
    if (state.expandedCards[cid]) {
      c.classList.add("active");
      c.querySelector(".card-body").style.display = "block";
    } else {
      c.classList.remove("active");
      c.querySelector(".card-body").style.display = "none";
    }
  });

  // Re-render navigation rail highlights
  const rail = document.getElementById("nav-rail");
  if (rail) {
    const dots = rail.querySelectorAll(".nav-dot");
    dots.forEach((dot, dotIdx) => {
      if (dotIdx === idx) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  }
};

// Reveal Model Answer
window.revealModelAnswer = function(qId) {
  state.shownAnswers[qId] = true;
  saveState();

  // Disable text area input to lock response
  const textarea = document.getElementById(`textarea-${qId}`);
  if (textarea) {
    textarea.disabled = true;
  }

  // Hide the reveal button container
  const btnShow = document.getElementById(`btn-show-${qId}`);
  if (btnShow) {
    btnShow.disabled = true;
    btnShow.style.display = "none";
  }

  // Slide down model answer and evaluation panels
  const modelSection = document.getElementById(`model-${qId}`);
  const evalSection = document.getElementById(`eval-${qId}`);

  if (modelSection) modelSection.style.display = "block";
  if (evalSection) evalSection.style.display = "block";

  // Re-render header status badge to "تم عرض الجواب"
  const cardHeader = document.getElementById(`card-${qId}`);
  if (cardHeader) {
    const badge = cardHeader.querySelector(".status-badge");
    if (badge) {
      badge.textContent = "تم عرض الجواب";
      badge.className = "status-badge status-viewed";
    }
  }

  // Update progress numbers
  renderPracticeScreenProgressOnly();
};

// Rate Question (0, 5, 10 marks)
window.rateQuestion = function(qId, score) {
  state.ratings[qId] = score;
  saveState();

  // Re-highlight evaluated buttons
  const evalSec = document.getElementById(`eval-${qId}`);
  if (evalSec) {
    const btns = evalSec.querySelectorAll(".btn-eval");
    btns.forEach(btn => {
      btn.className = "btn-eval"; // clear
      const btnScore = parseInt(btn.textContent.trim());
      if (btnScore === score) {
        btn.classList.add(`selected-${score}`);
      }
    });
  }

  // Update header badge
  const cardHeader = document.getElementById(`card-${qId}`);
  if (cardHeader) {
    const badge = cardHeader.querySelector(".status-badge");
    if (badge) {
      badge.textContent = "تم التقييم";
      badge.className = "status-badge status-rated";
    }
  }
};

// Set mastery status
window.setMasteryStatus = function(qId, status) {
  state.mastery[qId] = status;
  saveState();

  // Re-highlight mastery buttons in active accordion card
  const evalSec = document.getElementById(`eval-${qId}`);
  if (evalSec) {
    const btns = evalSec.querySelectorAll(".btn-mastery");
    btns.forEach((btn, idx) => {
      btn.className = "btn-mastery"; // reset
      if (idx === 0 && status === "high") btn.classList.add("selected-high");
      if (idx === 1 && status === "mid") btn.classList.add("selected-mid");
      if (idx === 2 && status === "low") btn.classList.add("selected-low");
    });
  }

  // Re-render mastery badge in header
  const cardHeader = document.getElementById(`card-${qId}`);
  if (cardHeader) {
    let badgeContainer = cardHeader.querySelector(".mastery-badge");
    if (!badgeContainer) {
      badgeContainer = document.createElement("span");
      const statusBadge = cardHeader.querySelector(".status-badge");
      cardHeader.querySelector(".card-header-right").insertBefore(badgeContainer, statusBadge);
    }

    badgeContainer.className = "mastery-badge";
    if (status === "high") {
      badgeContainer.textContent = "متمكن";
      badgeContainer.classList.add("mastery-high");
    } else if (status === "mid") {
      badgeContainer.textContent = "يحتاج مراجعة";
      badgeContainer.classList.add("mastery-mid");
    } else if (status === "low") {
      badgeContainer.textContent = "غير متمكن";
      badgeContainer.classList.add("mastery-low");
    }
  }
};

// Tiny helper to update progress bar without full re-render (smooth performance)
function renderPracticeScreenProgressOnly() {
  const totalQuestions = QUESTIONS.length;
  const answeredCount = QUESTIONS.filter(q => (state.answers[q.id] || "").trim().length > 0).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const labels = document.querySelectorAll(".progress-label");
  if (labels.length >= 2) {
    labels[0].textContent = `تقدمك في الحل: ${answeredCount} من ${totalQuestions} أسئلة`;
    labels[1].textContent = `${progressPercent}%`;
  }
  const bar = document.querySelector(".progress-bar-inner");
  if (bar) {
    bar.style.width = `${progressPercent}%`;
  }

  // Update navigation rail dots statuses
  const rail = document.getElementById("nav-rail");
  if (rail) {
    const dots = rail.querySelectorAll(".nav-dot");
    QUESTIONS.forEach((q, idx) => {
      if (state.answers[q.id]) {
        dots[idx].classList.add("answered");
      } else {
        dots[idx].classList.remove("answered");
      }
    });
  }
}

// 3. Results Screen Layout
function renderResultsScreen(container) {
  const totalQuestions = QUESTIONS.length;
  
  // Calculate numbers
  const answeredCount = QUESTIONS.filter(q => (state.answers[q.id] || "").trim().length > 0).length;
  const shownCount = QUESTIONS.filter(q => state.shownAnswers[q.id]).length;
  const ratedCount = QUESTIONS.filter(q => state.ratings[q.id] !== undefined).length;
  
  // Max possible score is count of all questions * 10
  const maxScore = totalQuestions * 10;
  
  // Total sum of all self ratings
  let totalScore = 0;
  QUESTIONS.forEach(q => {
    if (state.ratings[q.id] !== undefined) {
      totalScore += state.ratings[q.id];
    }
  });

  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  // Calculate Mastery Counters
  let masteryHigh = 0;
  let masteryMid = 0;
  let masteryLow = 0;

  QUESTIONS.forEach(q => {
    const m = state.mastery[q.id];
    if (m === "high") masteryHigh++;
    else if (m === "mid") masteryMid++;
    else if (m === "low") masteryLow++;
  });

  // Collect unrated question indices
  const unratedQuestions = [];
  QUESTIONS.forEach((q, idx) => {
    // A question is unrated if answered or shown but no score was selected yet
    if (state.shownAnswers[q.id] && state.ratings[q.id] === undefined) {
      unratedQuestions.push({ num: idx + 1, id: q.id });
    }
  });

  const resultsHTML = `
    <div class="results-screen">
      <h2 class="results-title">تقرير الأداء والتقييم الذاتي</h2>
      
      <div class="score-circle-container">
        <div class="score-circle">
          <span class="score-value">${totalScore}/${maxScore}</span>
          <span class="score-label">النسبة المئوية: ${percentage}%</span>
        </div>
      </div>

      <div class="results-grid">
        <div class="stat-item">
          <span class="stat-label">عدد الأسئلة الكلي:</span>
          <span class="stat-val">${totalQuestions}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">الأسئلة التي تمت إجابتها:</span>
          <span class="stat-val">${answeredCount}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">الإجابات النموذجية المعروضة:</span>
          <span class="stat-val">${shownCount}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">الأسئلة التي تم تقييمها:</span>
          <span class="stat-val">${ratedCount}</span>
        </div>
      </div>

      <div class="mastery-summary">
        <h3 class="mastery-summary-title">ملخص مستوى التمكن:</h3>
        <div class="mastery-summary-grid">
          <div class="mastery-sum-card high">
            <span class="mastery-sum-count">${masteryHigh}</span>
            <span class="mastery-sum-label">متمكن من السؤال</span>
          </div>
          <div class="mastery-sum-card mid">
            <span class="mastery-sum-count">${masteryMid}</span>
            <span class="mastery-sum-label">أحتاج إلى مراجعة الموضوع</span>
          </div>
          <div class="mastery-sum-card low">
            <span class="mastery-sum-count">${masteryLow}</span>
            <span class="mastery-sum-label">غير متمكن</span>
          </div>
        </div>
      </div>

      ${unratedQuestions.length > 0 ? `
        <div class="unrated-list">
          <div class="unrated-title">تنبيه: لديك أسئلة تم عرض إجابتها النموذجية ولكن لم تقيمها بعد:</div>
          <div class="unrated-items">
            ${unratedQuestions.map(q => `
              <span class="unrated-link" onclick="jumpToQuestion(${QUESTIONS.findIndex(item => item.id === q.id)})">
                سؤال ${q.num}
              </span>
            `).join("")}
          </div>
        </div>
      ` : ""}

      <div class="results-actions">
        <button class="btn btn-primary" id="btn-return-practice">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-edit-3"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          العودة لتعديل التقييمات
        </button>
        <button class="btn btn-secondary" id="btn-results-reset">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          بدء محاولة جديدة تماماً
        </button>
      </div>
    </div>
  `;

  container.innerHTML = resultsHTML;

  // Event handlers
  const btnReturn = document.getElementById("btn-return-practice");
  const btnReset = document.getElementById("btn-results-reset");

  if (btnReturn) {
    btnReturn.addEventListener("click", () => navigateTo("practice"));
  }

  if (btnReset) {
    btnReset.addEventListener("click", () => promptReset());
  }
}

// Result list click to jump to specific question index
window.jumpToQuestion = function(idx) {
  navigateTo("practice");
  setFocusedIndex(idx);
};
