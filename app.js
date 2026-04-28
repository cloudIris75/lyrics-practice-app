// 문제 단위: 라인 하나 = 문제 하나 (개수 제한 없이 추가 가능)
const PROBLEMS = [
  {
    line: "Standing in the morning light",
    syllables: [2, 1, 1, 2, 1],
    source: "예시 팝송 A · Verse 1",
  },
  {
    line: "Everything will be alright",
    syllables: [4, 1, 1, 2],
    source: "예시 팝송 A · Verse 1",
  },
  {
    line: "Running through the open door",
    syllables: [2, 1, 1, 2, 1],
    source: "예시 팝송 B · Chorus",
  },
  {
    line: "Never felt this way before",
    syllables: [2, 1, 1, 1, 2],
    source: "예시 팝송 B · Chorus",
  },
  {
    line: "Counting every star tonight",
    syllables: [2, 3, 1, 2],
    source: "예시 팝송 C · Bridge",
  },
  {
    line: "Holding on with all my might",
    syllables: [2, 1, 1, 1, 1, 1],
    source: "예시 팝송 C · Bridge",
  },
];

function parseInput(raw) {
  return raw.trim().split(/\s+/).map(Number);
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function render() {
  const tbody = document.getElementById("problemBody");
  tbody.innerHTML = PROBLEMS.map((p, i) => {
    const words = p.line.split(" ");
    const hint = words.map(w => "?").join(" ");
    return `
      <tr id="row-${i}">
        <td class="cell-num">${i + 1}</td>
        <td class="cell-source">${p.source}</td>
        <td class="cell-line">${p.line}</td>
        <td class="cell-words">${words.length}단어</td>
        <td class="cell-input">
          <input
            class="answer-input"
            id="input-${i}"
            type="text"
            placeholder="${hint}"
            autocomplete="off"
            spellcheck="false"
            onkeydown="handleKey(event, ${i})"
          />
        </td>
        <td class="cell-feedback" id="fb-${i}"></td>
      </tr>
    `;
  }).join("");

  document.getElementById("result").innerHTML = "";
  document.getElementById("checkBtn").style.display = "inline-block";
  document.getElementById("resetBtn").style.display = "none";

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
  let correct = 0;

  PROBLEMS.forEach((p, i) => {
    const raw = document.getElementById(`input-${i}`).value;
    const input = parseInput(raw);
    const row = document.getElementById(`row-${i}`);
    const fb = document.getElementById(`fb-${i}`);

    if (arraysEqual(input, p.syllables)) {
      row.className = "correct";
      fb.innerHTML = `<span class="ok">✓ ${p.syllables.join(" ")}</span>`;
      correct++;
    } else {
      row.className = "wrong";
      const given = input.every(n => !isNaN(n) && n > 0) ? input.join(" ") : "—";
      fb.innerHTML = `<span class="err">✗</span> <span class="ans">정답: ${p.syllables.join(" ")}</span>`;
    }
  });

  const total = PROBLEMS.length;
  document.getElementById("result").innerHTML = `
    <span class="score">${correct} / ${total}</span>
    <span class="score-label">정답</span>
    ${correct === total ? '<span class="perfect">🎉 완벽!</span>' : ""}
  `;

  document.getElementById("checkBtn").style.display = "none";
  document.getElementById("resetBtn").style.display = "inline-block";
}

function resetAll() {
  PROBLEMS.forEach((_, i) => {
    document.getElementById(`input-${i}`).value = "";
    document.getElementById(`row-${i}`).className = "";
    document.getElementById(`fb-${i}`).innerHTML = "";
  });
  document.getElementById("result").innerHTML = "";
  document.getElementById("checkBtn").style.display = "inline-block";
  document.getElementById("resetBtn").style.display = "none";
  document.getElementById("input-0")?.focus();
}

render();
