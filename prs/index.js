const axios = require("axios");
const { faker } = require("@faker-js/faker");

// Konfigurasi
const GITHUB_TOKEN = "ghp_YOUR_TOKEN";
const REPO_OWNER = "USERNAME";
const REPO_NAME = "REPO_NAME";
const BASE_BRANCH = "main";
const TOTAL_PRS = 75; // total PRS

const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github.v3+json",
};

// Fungsi delay
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fungsi untuk membuat cabang baru dari main
async function createBranch(branchName) {
  const mainBranchUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/ref/heads/${BASE_BRANCH}`;
  const createBranchUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/refs`;

  try {
    const response = await axios.get(mainBranchUrl, { headers });
    const sha = response.data.object.sha;

    await axios.post(
      createBranchUrl,
      {
        ref: `refs/heads/${branchName}`,
        sha: sha,
      },
      { headers }
    );

    console.log(`✅ Created branch: ${branchName}`);
  } catch (error) {
    console.error(
      `❌ Failed to create branch ${branchName}:`,
      error.response ? error.response.data : error.message
    );
  }
}

// Fungsi untuk menambahkan file baru ke branch
async function createFile(branchName, filePath, content) {
  const fileUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`;

  try {
    await axios.put(
      fileUrl,
      {
        message: `Add ${filePath}`,
        content: Buffer.from(content).toString("base64"),
        branch: branchName,
      },
      { headers }
    );

    console.log(`✅ File added: ${filePath} on ${branchName}`);
  } catch (error) {
    console.error(
      `❌ Failed to add file on ${branchName}:`,
      error.response ? error.response.data : error.message
    );
  }
}

// Fungsi untuk membuat pull request
async function createPullRequest(branchName, title, body) {
  const prUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls`;

  try {
    const response = await axios.post(
      prUrl,
      {
        title: title,
        head: branchName,
        base: BASE_BRANCH,
        body: body,
      },
      { headers }
    );

    console.log(`✅ Pull Request Created: ${response.data.html_url}`);
  } catch (error) {
    console.error(
      `❌ Failed to create PR for ${branchName}:`,
      error.response ? error.response.data : error.message
    );
  }
}

// Fungsi utama untuk membuat banyak pull request
async function createMultiplePRs(count = 3) {
  for (let i = 0; i < count; i++) {
    const branchName = `feature-${faker.word.noun()}-${Date.now()}`;
    const fileName = `new-file-${i}.txt`;
    const fileContent = `This is an auto-generated file ${i}.\nGenerated on: ${new Date().toISOString()}`;
    const prTitle = faker.hacker.phrase();
    const prBody = faker.lorem.paragraph();

    await createBranch(branchName);
    await createFile(branchName, fileName, fileContent);
    await createPullRequest(branchName, prTitle, prBody);

    // Delay random antara 1 - 25 ms
    const delay = Math.floor(Math.random() * 25) + 1;
    await sleep(delay);
    console.log(`⏳ Delay ${delay}ms before next PR`);
  }
}

// Jalankan
createMultiplePRs(TOTAL_PRS);
