const simpleGit = require("simple-git");
const moment = require("moment");
const jsonfile = require("jsonfile");
const fs = require("fs");
const axios = require("axios");

// Import fungsi dari description.js
const { getUniqueWords, showRemainingWords } = require("./randomWord");

// ========== KONFIGURASI ==========
const REPOSITORY_PATH =
  "/home/eep/Development/repository/hacking/gh-automation/contribution";
const GITHUB_TOKEN = "ghp_YOUR_TOKEN"; // Ganti dengan token GitHub Anda
const GITHUB_REPO = "REPO_NAME";
const REPO_DESCRIPTION = getUniqueWords(1);
const REPO_PRIVATE = false; // Set true untuk repository private
const REPO_TOPICS = getUniqueWords(3);
const BRANCH = "main";
const FILE_PATH = "./data.json";
const TOTAL_COMMITS = 800; // total commit
// =================================

const git = simpleGit(REPOSITORY_PATH);
const TODAY = moment().startOf("day");
const CURRENT_YEAR = moment().year();
// const CURRENT_YEAR = 2024;
const WEEKS_IN_YEAR = 52;
const DAYS_IN_WEEK = 7;

/**
 * Mendapatkan informasi user dari GitHub API
 */
// SESUAI email TAPI HILANG COMMITNYA jika di ganti email
// async function getGitHubUserInfo() {
//   try {
//     const userRes = await axios.get("https://api.github.com/user", {
//       headers: {
//         Authorization: `token ${GITHUB_TOKEN}`,
//         Accept: "application/vnd.github.v3+json",
//       },
//     });
//     // console.log('🧾 Respon dari /user:', userRes.data);

//     let email = userRes.data.email;

//     // Jika email tidak tersedia, ambil dari endpoint /user/emails
//     if (!email) {
//       const emailsRes = await axios.get("https://api.github.com/user/emails", {
//         headers: {
//           Authorization: `token ${GITHUB_TOKEN}`,
//           Accept: "application/vnd.github.v3+json",
//         },
//       });
//       // console.log('📬 Respon dari /user/emails:', emailsRes.data);

//       const primaryEmail = emailsRes.data.find((e) => e.primary && e.verified);
//       if (primaryEmail) {
//         email = primaryEmail.email;
//       } else {
//         email = `${userRes.data.login}@users.noreply.github.com`;
//       }
//     }

//     return {
//       username: userRes.data.login,
//       name: userRes.data.name || userRes.data.login,
//       email,
//     };
//   } catch (error) {
//     console.error(
//       "⚠️ Gagal mengambil info user:",
//       error.response?.data?.message || error.message
//     );
//     throw new Error("Tidak bisa mendapatkan informasi user dari GitHub");
//   }
// }

// TIDAK SESUAI EMAIL TAPI TIDAK HILANG COMMITNYA jika di ganti email
async function getGitHubUserInfo() {
  try {
    const userRes = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const username = userRes.data.login;
    const name = userRes.data.name || username;

    // Gunakan email noreply GitHub agar konsisten
    const email = `${username}@users.noreply.github.com`;

    return {
      username,
      name,
      email,
    };
  } catch (error) {
    console.error(
      "⚠️ Gagal mengambil info user:",
      error.response?.data?.message || error.message
    );
    throw new Error("Tidak bisa mendapatkan informasi user dari GitHub");
  }
}

/**
 * Membuat repository baru di GitHub
 */
async function createGitHubRepository() {
  try {
    const { username } = await getGitHubUserInfo();
    console.log(`🆕 Mencoba membuat repository ${GITHUB_REPO}...`);

    const response = await axios.post(
      "https://api.github.com/user/repos",
      {
        name: GITHUB_REPO,
        description: REPO_DESCRIPTION,
        private: REPO_PRIVATE,
        auto_init: true,
        has_issues: true,
        has_projects: true,
        has_wiki: true,
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    console.log(`✅ Repository ${GITHUB_REPO} berhasil dibuat`);

    // Set topics setelah repository dibuat
    await setRepositoryTopics(username);

    return username;
  } catch (error) {
    if (error.response?.status === 422) {
      console.log(`ℹ️ Repository ${GITHUB_REPO} sudah ada`);
      return (await getGitHubUserInfo()).username;
    }
    console.error(
      "❌ Gagal membuat repository:",
      error.response?.data?.message || error.message
    );
    throw new Error("Gagal membuat repository");
  }
}

/**
 * Mengupdate description repository yang sudah ada
 */
async function updateRepositoryMetadata(username) {
  try {
    await axios.patch(
      `https://api.github.com/repos/${username}/${GITHUB_REPO}`,
      {
        description: REPO_DESCRIPTION,
        private: REPO_PRIVATE,
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    console.log("🔄 Metadata repository berhasil diupdate");

    // Update topics
    await setRepositoryTopics(username);
  } catch (error) {
    console.error("⚠️ Gagal mengupdate metadata repository:", error.message);
  }
}

/**
 * Mengatur topics repository
 */
async function setRepositoryTopics(username) {
  try {
    await axios.put(
      `https://api.github.com/repos/${username}/${GITHUB_REPO}/topics`,
      {
        names: REPO_TOPICS,
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.mercy-preview+json",
        },
      }
    );
    console.log(`🏷️ Topics berhasil ditambahkan: ${REPO_TOPICS.join(", ")}`);
    showRemainingWords(); // tampilkan jumlah kata yg tersisa
  } catch (error) {
    console.error("⚠️ Gagal menambahkan topics:", error.message);
  }
}

/**
 * Setup repository Git
 */
async function setupRepository() {
  try {
    // Buat direktori jika belum ada
    if (!fs.existsSync(REPOSITORY_PATH)) {
      fs.mkdirSync(REPOSITORY_PATH, { recursive: true });
      console.log(`📁 Direktori ${REPOSITORY_PATH} dibuat`);
    }

    // Dapatkan info user dan buat repository jika perlu
    const username = await createGitHubRepository();
    const { name, email } = await getGitHubUserInfo();
    console.log(`🔑 Login sebagai: ${name} (${username}) <${email}>`);

    // Update metadata untuk repository yang sudah ada
    await updateRepositoryMetadata(username);

    // Inisialisasi Git repo
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      await git.init();
      console.log("🆕 Repository Git lokal diinisialisasi");
    }

    // Atur konfigurasi user
    await git.addConfig("user.name", name);
    await git.addConfig("user.email", email);
    console.log("⚙️ Konfigurasi Git diatur");

    // Atur remote origin
    const remoteUrl = `https://${GITHUB_TOKEN}@github.com/${username}/${GITHUB_REPO}.git`;
    await git.removeRemote("origin").catch(() => {});
    await git.addRemote("origin", remoteUrl);
    console.log("🔗 Remote origin diatur");

    // Buat branch main jika belum ada
    const branches = await git.branchLocal();
    if (!branches.all.includes(BRANCH)) {
      await git.checkoutLocalBranch(BRANCH);
      console.log(`🌿 Branch ${BRANCH} dibuat`);
    }

    return username;
  } catch (error) {
    console.error("❌ Setup repository gagal:", error.message);
    throw error;
  }
}

/**
 * Generate tanggal acak
 */
function generateRandomDate() {
  const weeks = Math.floor(Math.random() * WEEKS_IN_YEAR);
  const days = Math.floor(Math.random() * DAYS_IN_WEEK);
  return moment()
    .year(CURRENT_YEAR)
    .startOf("year")
    .add(weeks, "weeks")
    .add(days, "days");
}

/**
 * Membuat commit
 */
async function makeCommit(commitNumber) {
  let commitDate;
  do {
    commitDate = generateRandomDate();
  } while (commitDate.isSameOrAfter(TODAY));

  const formattedDate = commitDate.format();
  const data = { date: formattedDate };

  console.log(`📌 Commit ${commitNumber}/${TOTAL_COMMITS}: ${formattedDate}`);

  await jsonfile.writeFile(FILE_PATH, data);
  await git.add(FILE_PATH);
  await git.commit(formattedDate, { "--date": formattedDate });
}

/**
 * Membuat initial commit jika diperlukan
 */
async function createInitialCommit() {
  const log = await git.log().catch(() => ({ total: 0 }));
  if (log.total === 0) {
    await jsonfile.writeFile(FILE_PATH, { initialized: true });
    await git.add(FILE_PATH);
    await git.commit("Initial commit");
    console.log("🆕 Commit awal dibuat");
  }
}

/**
 * Push changes ke remote repository
 */
async function pushChanges() {
  try {
    console.log("🔼 Mempushing commit ke GitHub...");
    // Coba force push pertama kali untuk branch baru
    await git.push(["-u", "origin", BRANCH, "--force"]);
    console.log("✅ Semua commit berhasil dipush!");
  } catch (pushError) {
    console.log("⚠️ Push pertama gagal, mencoba push normal...");
    await git.push(["-u", "origin", BRANCH]);
    console.log("✅ Push berhasil setelah mencoba metode normal");
  }
}

/**
 * Proses utama
 */
async function main() {
  try {
    console.log("🚀 Memulai proses...");

    // Setup repository
    await setupRepository();

    // Buat commit awal jika diperlukan
    await createInitialCommit();

    // Buat commit sebanyak yang ditentukan
    for (let i = 1; i <= TOTAL_COMMITS; i++) {
      await makeCommit(i);
    }

    // Push ke remote
    await pushChanges();

    console.log("🎉 Semua proses berhasil diselesaikan!");
  } catch (error) {
    console.error("💥 Proses gagal:", error.message);
    process.exit(1);
  }
}

// Jalankan program
main().catch(console.error);
