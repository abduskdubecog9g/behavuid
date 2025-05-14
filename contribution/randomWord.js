const fs = require('fs');
const path = require('path');
const allWords = require('./allWords');

const USED_WORDS_FILE = path.join(__dirname, 'usedWords.json');

function loadUsedWords() {
  if (!fs.existsSync(USED_WORDS_FILE)) {
    fs.writeFileSync(USED_WORDS_FILE, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(USED_WORDS_FILE, 'utf-8'));
}

function saveUsedWords(words) {
  fs.writeFileSync(USED_WORDS_FILE, JSON.stringify(words, null, 2));
}

/**
 * Menampilkan sisa kata yang belum terpakai
 */
function showRemainingWords() {
  const used = loadUsedWords();
  const available = allWords.filter(word => !used.includes(word));
  console.log(`📋 Sisa kata yang tersedia (${available.length})`);
  return available;
}

/**
 * Mengambil n kata unik yang belum pernah dipakai
 */
function getUniqueWords(n = 1) {
  const used = loadUsedWords();
  const available = allWords.filter(word => !used.includes(word));

  if (available.length < n) {
    console.error(`❌ Tidak cukup kata unik tersisa. Diminta ${n}, hanya tersedia ${available.length}.`);
    console.log(`📋 Sisa kata: ${available.join(', ')}`);
    throw new Error("Kata tidak mencukupi");
  }

  // Acak dan ambil n kata
  const selected = available.sort(() => 0.5 - Math.random()).slice(0, n);
  const updatedUsed = [...used, ...selected];

  saveUsedWords(updatedUsed);

  // console.log(`✅ Kata dipilih: ${selected.join(', ')}`);
  return n === 1 ? selected[0] : selected;
}

module.exports = {
  getUniqueWords,
  showRemainingWords
};
