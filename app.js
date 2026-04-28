// 연습용 예시 문장 데이터 (실제 곡 형식 모방, 저작권 없는 예시)
const SONGS = [
  {
    title: "예시 팝송 A",
    artist: "Practice Artist",
    part: "Verse 1",
    lines: [
      "Standing in the morning light",
      "Everything will be alright",
    ],
    words: [
      { text: "Standing",    syllables: 2 },
      { text: "in",          syllables: 1 },
      { text: "the",         syllables: 1 },
      { text: "morning",     syllables: 2 },
      { text: "light",       syllables: 1 },
      { text: "Everything",  syllables: 4 },
      { text: "will",        syllables: 1 },
      { text: "be",          syllables: 1 },
      { text: "alright",     syllables: 2 },
    ],
  },
  {
    title: "예시 팝송 B",
    artist: "Practice Artist",
    part: "Chorus",
    lines: [
      "Running through the open door",
      "Never felt this way before",
    ],
    words: [
      { text: "Running",   syllables: 2 },
      { text: "through",   syllables: 1 },
      { text: "the",       syllables: 1 },
      { text: "open",      syllables: 2 },
      { text: "door",      syllables: 1 },
      { text: "Never",     syllables: 2 },
      { text: "felt",      syllables: 1 },
      { text: "this",      syllables: 1 },
      { text: "way",       syllables: 1 },
      { text: "before",    syllables: 2 },
    ],
  },
  {
    title: "예시 팝송 C",
    artist: "Practice Artist",
    part: "Bridge",
    lines: [
      "Counting every star tonight",
      "Holding on with all my might",
    ],
    words: [
      { text: "Counting",  syllables: 2 },
      { text: "every",     syllables: 3 },
      { text: "star",      syllables: 1 },
      { text: "tonight",   syllables: 2 },
      { text: "Holding",   syllables: 2 },
      { text: "on",        syllables: 1 },
      { text: "with",      syllables: 1 },
      { text: "all",       syllables: 1 },
      { text: "my",        syllables: 1 },
      { text: "might",     syllables: 1 },
    ],
  },
];

let currentIndex = 0;

function renderSong() {
  const song = SONGS[currentIndex];

  // Song info
  document.getElementById("songInfo").innerHTML = `
    <div class="song-title">${song.title} — ${song.part}</div>
    <div class="song-meta">by ${song.artist}</div>
    <div class="lyric-line">${song.lines.map(l => `<span class="highlight">${l}</span>`).join("<br/>")}</div>
  `;

  // Quiz rows
  const quizArea = document.getElementById("quizArea");
  quizArea.innerHTML = song.words
    .map(
      (w, i) => `
      <div class="word-row" id="row-${i}">
        <span class="word-index">${i + 1}</span>
        <span class="word-text">${w.text}</span>
        <input
          class="syllable-input"
          id="input-${i}"
          type="number"
          min="1"
          max="9"
          placeholder="?"
          onkeydown="handleKey(event, ${i})"
        />
        <span class="syllable-label">음절</span>
        <span class="feedback" id="fb-${i}"></span>
      </div>
    `
    )
    .join("");

  // Reset UI
  document.getElementById("result").innerHTML = "";
  document.getElementById("checkBtn").style.display = "inline-block";
  document.getElementById("nextBtn").style.display = "none";

  // Focus first input
  const first = document.getElementById("input-0");
  if (first) first.focus();
}

function handleKey(e, index) {
  if (e.key === "Enter") {
    const song = SONGS[currentIndex];
    const next = document.getElementById(`input-${index + 1}`);
    if (next) {
      next.focus();
    } else {
      checkAnswers();
    }
  }
}

function checkAnswers() {
  const song = SONGS[currentIndex];
  let correct = 0;

  song.words.forEach((w, i) => {
    const input = document.getElementById(`input-${i}`);
    const row = document.getElementById(`row-${i}`);
    const fb = document.getElementById(`fb-${i}`);
    const val = parseInt(input.value, 10);

    if (val === w.syllables) {
      row.className = "word-row correct";
      fb.textContent = `✓ ${w.syllables}음절`;
      fb.className = "feedback correct-msg";
      correct++;
    } else {
      row.className = "word-row wrong";
      fb.textContent = isNaN(val) ? `? → ${w.syllables}음절` : `✗ 정답: ${w.syllables}음절`;
      fb.className = "feedback wrong-msg";
    }
  });

  const total = song.words.length;
  const resultEl = document.getElementById("result");
  resultEl.innerHTML = `
    <div class="score">${correct} / ${total}</div>
    <div class="score-label">정답</div>
    ${correct === total ? '<div class="perfect">🎉 완벽해요!</div>' : ""}
  `;

  document.getElementById("checkBtn").style.display = "none";
  document.getElementById("nextBtn").style.display = "inline-block";
}

function nextSong() {
  currentIndex = (currentIndex + 1) % SONGS.length;
  renderSong();
}

// Init
renderSong();
