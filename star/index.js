const axios = require("axios");
const chalk = require("chalk");

// Daftar Personal Access Token (PAT) untuk beberapa user
const ACCESS_TOKENS = [
  "ghp_YOUR_TOKEN",
  "ghp_YOUR_TOKEN",
  "ghp_YOUR_TOKEN",
];

// Daftar repository dalam format "owner/repo"
const repositories = [
  // Contoh1: "username/reponame1"
  // Contoh2: "username/reponame2"
];

const STAR_API_URL = "https://api.github.com/user/starred";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Logging helper
const log = (message, type = "info") => {
  const time = new Date().toISOString().slice(11, 19);
  const types = {
    info: chalk.blue(`[${time}] [INFO]`),
    success: chalk.green(`[${time}] [SUCCESS]`),
    error: chalk.red(`[${time}] [ERROR]`),
    warn: chalk.yellow(`[${time}] [WARNING]`),
  };
  console.log(`${types[type]} ${message}`);
};

// Cek rate limit
async function checkRateLimit(token) {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
  };

  try {
    const response = await axios.get("https://api.github.com/rate_limit", {
      headers,
    });
    const { remaining, reset } = response.data.rate;
    log(
      `Token ${token.slice(0, 5)}... has ${remaining} remaining requests.`,
      "info"
    );
    if (remaining === 0) {
      const resetTime = new Date(reset * 1000);
      log(`Rate limit reached. Resets at: ${resetTime}`, "warn");
    }
  } catch {
    log(`Failed to check rate limit for token ${token.slice(0, 5)}.`, "error");
  }
}

// Cek apakah sudah di-star sebelumnya
async function isStarred(token, repo) {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
  };

  try {
    const response = await axios.get(`${STAR_API_URL}/${repo}`, { headers });
    return response.status === 204;
  } catch (error) {
    if (error.response?.status === 404) {
      return false;
    }
    log(`Gagal mengecek status star untuk ${repo}: ${error.message}`, "error");
    return false;
  }
}

// Star repo jika belum
async function starRepository(token, repo) {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
  };

  const alreadyStarred = await isStarred(token, repo);
  if (alreadyStarred) {
    log(
      `🔁 Repository ${chalk.bold(repo)} sudah di-star sebelumnya. Melewati...`,
      "info"
    );
    return;
  }

  try {
    const response = await axios.put(`${STAR_API_URL}/${repo}`, null, {
      headers,
    });
    if (response.status === 204) {
      log(
        `⭐ Berhasil menambahkan star ke ${chalk.bold(
          repo
        )} menggunakan token ${token.slice(0, 5)}...`,
        "success"
      );
    } else {
      log(`Unexpected response ${response.status} untuk ${repo}`, "error");
    }
  } catch (error) {
    const status = error.response?.status || "Unknown";
    log(
      `Gagal menambahkan star ke ${repo} dengan token ${token.slice(
        0,
        5
      )}: ${status}`,
      "error"
    );

    if (status === 403) {
      log(
        "403 Forbidden: Token mungkin tidak cukup izin atau terkena rate limit.",
        "warn"
      );
    } else if (status === 404) {
      log(`404 Not Found: Repo ${repo} tidak ditemukan.`, "warn");
    } else {
      log("Periksa koneksi atau token GitHub.", "warn");
    }
  }
}

// Jalankan semua
async function starRepositoriesWithDelay(tokens, repoList) {
  for (const token of tokens) {
    log(`🔑 Menggunakan token ${token.slice(0, 5)}...`, "info");
    await checkRateLimit(token);

    for (const repo of repoList) {
      await starRepository(token, repo);

      const delay = Math.floor(Math.random() * 3000) + 1;
      log(`⏱️ Menunggu ${delay}ms sebelum lanjut...`, "info");
      await sleep(delay);
    }
  }
}

// Start script
starRepositoriesWithDelay(ACCESS_TOKENS, repositories);
