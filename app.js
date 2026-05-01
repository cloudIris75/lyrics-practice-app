// 문제 풀: 날짜 기반으로 하루 한 문제 출제
// lines 배열에 { text, syllables } 추가만 하면 문제 수 제한 없음
const PROBLEMS = [
  {
    lines: [
      { text: "Standing in the morning light", syllables: [2, 1, 1, 2, 1] },
      { text: "Everything will be alright",    syllables: [4, 1, 1, 2]    },
      { text: "Running through the open door", syllables: [2, 1, 1, 2, 1] },
      { text: "Never felt this way before",    syllables: [2, 1, 1, 1, 2] },
    ],
  },
  {
    lines: [
      { text: "Counting every star tonight",   syllables: [2, 3, 1, 2]       },
      { text: "Holding on with all my might",  syllables: [2, 1, 1, 1, 1, 1] },
      { text: "Somewhere far beyond the sea",  syllables: [3, 1, 3, 1, 1]    },
      { text: "You are always close to me",    syllables: [1, 1, 2, 1, 1, 1] },
    ],
  },
  {
    lines: [
      { text: "Waking up to a brand new day",   syllables: [2, 1, 1, 1, 1, 1]    },
      { text: "Chasing all the clouds away",    syllables: [2, 1, 1, 2, 2]        },
      { text: "Every little thing you do",      syllables: [3, 2, 1, 1, 1]        },
      { text: "Makes me fall in love with you", syllables: [1, 1, 1, 1, 1, 1, 1] },
    ],
  },
];

// ── 날짜 유틸 ──────────────────────────────────────────────────────────────
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function todayProblemIndex() {
  const [y, m, day] = todayKey().split("-").map(Number);
  const epoch = new Date(2025, 0, 1);
  const today = new Date(y, m - 1, day);
  const daysSince = Math.floor((today - epoch) / 86400000);
  return daysSince % PROBLEMS.length;
}

function tomorrowMidnight() {
  const t = new Date();
  t.setHours(24, 0, 0, 0);
  return t;
}

function formatCountdown(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// ── 상태 ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = "lyrics_daily";

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}

function saveState(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── 완료 화면 ─────────────────────────────────────────────────────────────
let countdownTimer = null;

function showDoneScreen(score, total) {
  document.querySelector("main").innerHTML = `
    <div class="done-screen">
      <div class="done-icon">🎉</div>
      <h2 class="done-title">오늘의 연습 완료!</h2>
      <div class="done-score">${score} / ${total} 정답</div>
      <p class="done-sub">내일 새로운 문제가 출제됩니다.</p>
      <div class="done-countdown-label">다음 문제까지</div>
      <div class="done-countdown" id="countdown">--:--:--</div>
    </div>
  `;
  startCountdown();
}

function showAlreadyDoneScreen() {
  document.querySelector("main").innerHTML = `
    <div class="done-screen">
      <div class="done-icon">✅</div>
      <h2 class="done-title">오늘의 연습을 이미 완료했어요!</h2>
      <p class="done-sub">내일 새로운 문제가 출제됩니다.</p>
      <div class="done-countdown-label">다음 문제까지</div>
      <div class="done-countdown" id="countdown">--:--:--</div>
    </div>
  `;
  startCountdown();
}

function startCountdown() {
  if (countdownTimer) clearInterval(countdownTimer);
  function tick() {
    const el = document.getElementById("countdown");
    if (!el) { clearInterval(countdownTimer); return; }
    const remaining = tomorrowMidnight() - Date.now();
    el.textContent = remaining > 0 ? formatCountdown(remaining) : "00:00:00";
  }
  tick();
  countdownTimer = setInterval(tick, 1000);
}

// ── 퀴즈 화면 ─────────────────────────────────────────────────────────────
const MAX_ATTEMPTS = 2;
let attempt = 1;          // 현재 시도 횟수
let lockedCorrect = [];   // 1차에서 맞힌 인덱스 (재시도 시 잠금)

function parseInput(raw) {
  return raw.trim().split(/\s+/).map(Number);
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function render(problem) {
  attempt = 1;
  lockedCorrect = [];

  document.getElementById("problemDate").textContent = `📅 ${todayKey()} 오늘의 문제`;

  const tbody = document.getElementById("problemBody");
  tbody.innerHTML = problem.lines.map((line, i) => `
    <tr id="row-${i}">
      <td class="cell-line">${line.text}</td>
      <td class="cell-input">
        <input
          class="answer-input"
          id="input-${i}"
          type="text"
          placeholder="${line.text.split(" ").map(() => "?").join(" ")}"
          autocomplete="off"
          spellcheck="false"
          onkeydown="handleKey(event, ${i})"
        />
      </td>
      <td class="cell-feedback" id="fb-${i}"></td>
    </tr>
  `).join("");

  document.getElementById("result").innerHTML = "";
  document.getElementById("checkBtn").style.display = "inline-block";
  document.getElementById("checkBtn").textContent = "정답 확인";
  document.getElementById("retryBtn").style.display = "none";
  document.getElementById("doneBtn").style.display = "none";

  document.getElementById("input-0")?.focus();
}

function handleKey(e, index) {
  const problem = PROBLEMS[todayProblemIndex()];
  // 잠긴 칸은 건너뛰기
  let next = index + 1;
  while (next < problem.lines.length && lockedCorrect.includes(next)) next++;
  if (e.key === "Enter") {
    const nextEl = document.getElementById(`input-${next}`);
    if (nextEl) nextEl.focus();
    else checkAnswers();
  }
}

function checkAnswers() {
  const problem = PROBLEMS[todayProblemIndex()];
  let correct = 0;
  const isFinal = attempt >= MAX_ATTEMPTS;

  problem.lines.forEach((line, i) => {
    const input_el = document.getElementById(`input-${i}`);
    const row = document.getElementById(`row-${i}`);
    const fb = document.getElementById(`fb-${i}`);

    // 이미 1차에서 맞힌 칸은 그대로 유지
    if (lockedCorrect.includes(i)) { correct++; return; }

    const val = parseInput(input_el.value);
    if (arraysEqual(val, line.syllables)) {
      row.className = "correct";
      fb.innerHTML = `<span class="ok">✓ ${line.syllables.join(" ")}</span>`;
      input_el.disabled = true;
      lockedCorrect.push(i);
      correct++;
    } else {
      row.className = isFinal ? "wrong final" : "wrong";
      fb.innerHTML = isFinal
        ? `<span class="err">✗</span> <span class="ans">${line.syllables.join(" ")}</span>`
        : `<span class="err">✗</span> <span class="retry-hint">다시 시도해보세요</span>`;
      if (isFinal) {
        input_el.disabled = true;
      } else {
        input_el.value = "";   // 틀린 칸만 초기화
      }
    }
  });

  const total = problem.lines.length;
  const allCorrect = correct === total;

  // 점수 표시
  document.getElementById("result").innerHTML = `
    <span class="score">${correct} / ${total}</span>
    <span class="score-label">정답</span>
    ${allCorrect ? '<span class="perfect">🎉 완벽!</span>' : ""}
    ${!allCorrect && !isFinal ? '<span class="retry-msg">한 번 더 기회가 있어요!</span>' : ""}
  `;

  document.getElementById("checkBtn").style.display = "none";

  if (allCorrect || isFinal) {
    // 최종 완료 처리
    const state = loadState();
    state[todayKey()] = { score: correct, total };
    saveState(state);
    document.getElementById("doneBtn").style.display = "inline-block";
    document.getElementById("retryBtn").style.display = "none";
  } else {
    // 재시도 가능
    attempt++;
    document.getElementById("retryBtn").style.display = "inline-block";
    // 첫 번째 틀린 칸으로 포커스
    const firstWrong = problem.lines.findIndex((_, i) => !lockedCorrect.includes(i));
    document.getElementById(`input-${firstWrong}`)?.focus();
  }
}

function retryWrong() {
  document.getElementById("retryBtn").style.display = "none";
  document.getElementById("checkBtn").style.display = "inline-block";
  document.getElementById("checkBtn").textContent = `정답 확인 (${attempt}/${MAX_ATTEMPTS}차)`;
  document.getElementById("result").innerHTML = "";
}

function finishForToday() {
  const state = loadState();
  const record = state[todayKey()];
  showDoneScreen(record?.score ?? 0, record?.total ?? PROBLEMS[todayProblemIndex()].lines.length);
}

// ── 진입점 ────────────────────────────────────────────────────────────────
(function init() {
  const state = loadState();
  if (state[todayKey()]) {
    showAlreadyDoneScreen();
  } else {
    render(PROBLEMS[todayProblemIndex()]);
  }
})();
