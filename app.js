// 문제 단위: 파트 하나 = 여러 라인 묶음
// lines 배열에 { text, syllables } 형식으로 추가하면 문제 수 제한 없음
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
      { text: "Counting every star tonight",   syllables: [2, 3, 1, 2]    },
      { text: "Holding on with all my might",  syllables: [2, 1, 1, 1, 1, 1] },
      { text: "Somewhere far beyond the sea",  syllables: [3, 1, 3, 1, 1] },
      { text: "You are always close to me",    syllables: [1, 1, 2, 1, 1, 1] },
    ],
  },
  {
    lines: [
      { text: "Waking up to a brand new day",  syllables: [2, 1, 1, 1, 1, 1] },
      { text: "Chasing all the clouds away",   syllables: [2, 1, 1, 2, 2]  },
      { text: "Every little thing you do",     syllables: [3, 2, 1, 1, 1]  },
      { text: "Makes me fall in love with you", syllables: [1, 1, 1, 1, 1, 1, 1] },
    ],
  },
];

let currentIndex = 0;
let problemCount = 0;
let checked = false;

function randomIndex() {
  if (PROBLEMS.length === 1) return 0;
  let next;
  do { next = Math.floor(Math.random() * PROBLEMS.length); } while (next === currentIndex);
  return next;
}

function parseInput(raw) {
  return raw.trim().split(/\s+/).map(Number);
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function render() {
  checked = false;
  const problem = PROBLEMS[currentIndex];

  document.getElementById("problemNum").textContent = `문제 #${problemCount}`;

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
  document.getElementById("nextBtn").style.display = "none";
  document.getElementById("nextBtn").textContent = "다음 문제 →";

  document.getElementById("input-0")?.focus();
}

function handleKey(e, index) {
  if (e.key === "Enter") {
    const next = document.getElementById(`input-${index + 1}`);
    if (next) next.focus();
    else checkAnswers();
  }
}

function checkAnswers() {
  if (checked) return;
  checked = true;

  const problem = PROBLEMS[currentIndex];
  let correct = 0;

  problem.lines.forEach((line, i) => {
    const raw = document.getElementById(`input-${i}`).value;
    const input = parseInput(raw);
    const row = document.getElementById(`row-${i}`);
    const fb = document.getElementById(`fb-${i}`);

    if (arraysEqual(input, line.syllables)) {
      row.className = "correct";
      fb.innerHTML = `<span class="ok">✓ ${line.syllables.join(" ")}</span>`;
      correct++;
    } else {
      row.className = "wrong";
      fb.innerHTML = `<span class="err">✗</span> <span class="ans">${line.syllables.join(" ")}</span>`;
    }
  });

  const total = problem.lines.length;
  document.getElementById("result").innerHTML = `
    <span class="score">${correct} / ${total}</span>
    <span class="score-label">정답</span>
    ${correct === total ? '<span class="perfect">🎉 완벽!</span>' : ""}
  `;

  document.getElementById("checkBtn").style.display = "none";
  document.getElementById("nextBtn").style.display = "inline-block";
}

function nextProblem() {
  currentIndex = randomIndex();
  problemCount++;
  render();
}

currentIndex = Math.floor(Math.random() * PROBLEMS.length);
problemCount = 1;
render();
