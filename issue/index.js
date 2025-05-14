const axios = require("axios");
const { faker } = require("@faker-js/faker");
const chalk = require("chalk"); // Impor chalk untuk pewarnaan teks // npm install chalk@4

// Variabel konfigurasi
const GITHUB_TOKEN = "ghp_YOUR_TOKEN";
const REPO_OWNER = "USERNAME";
const REPO_NAME = "REPO_NAME";
const TOTAL_ISSUES = 75; // Ubah ini sesuai jumlah issue yang diinginkan

// GitHub API URL
const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`;

// Headers dengan otentikasi
const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github.v3+json",
};

// Fungsi delay acak
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fungsi untuk membuat issue secara otomatis
async function createIssue(title, body) {
  try {
    const data = { title, body };
    const response = await axios.post(url, data, { headers });
    console.log(
      chalk.green(`✅ Issue Created: `) + chalk.blue(response.data.html_url)
    ); // Menambahkan warna hijau untuk "✅" dan biru untuk URL
  } catch (error) {
    console.error(
      chalk.red("❌ Failed to create issue:") +
        (error.response
          ? chalk.yellow(error.response.data)
          : chalk.yellow(error.message))
    );
  }
}

// Fungsi untuk membuat banyak issue dengan data acak dan delay acak
async function createMultipleIssues(count) {
  for (let i = 0; i < count; i++) {
    const title = faker.hacker.phrase(); // Judul acak
    const body = faker.lorem.paragraph(); // Isi acak
    const randomDelay = Math.floor(Math.random() * 25) + 1; // 1–25 ms

    await delay(randomDelay);
    await createIssue(title, body);
  }
}

// Jalankan fungsi
createMultipleIssues(TOTAL_ISSUES);
