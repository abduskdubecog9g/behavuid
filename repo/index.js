const axios = require("axios");

// Konfigurasi
const GITHUB_TOKEN = "ghp_YOUR_TOKEN";
const TOTAL_REPOS = 30; // Jumlah repository yang ingin dibuat
const IS_PRIVATE = false; // true = private, false = public

const WORDS = [
  "JavaScript",
  "Python",
  "Java",
  "C",
  "C++",
  "C#",
  "Go",
  "Rust",
  "Swift",
  "Kotlin",
  "Ruby",
  "PHP",
  "TypeScript",
  "Perl",
  "Haskell",
  "Lua",
  "Scala",
  "Dart",
  "Objective-C",
  "R",
  "Elixir",
  "F#",
  "Lisp",
  "Scheme",
  "Groovy",
  "Erlang",
  "Julia",
  "Prolog",
  "Bash",
  "Shell",
  "Fortran",
  "COBOL",
  "Racket",
  "Ada",
  "ML",
  "Delphi",
  "Pascal",
  "PowerShell",
  "OCaml",
  "VHDL",
  "Verilog",
  "ABAP",
  "ActionScript",
  "APL",
  "Awk",
  "BBC BASIC",
  "BCPL",
  "Chapel",
  "Clojure",
  "Crystal",
  "D",
  "Forth",
  "IDL",
  "Icon",
  "J",
  "Nix",
  "Laravel",
  "Lamda",
  "S3",
  "Tailwind",
  "Echo",
  "Fiber",
  "Gin",
  "Gorm",
  "PostgreSQL",
  "MySQL",
  "MariaDB",
  "SQLite",
  "OracleDB",
  "SQL Server",
  "MongoDB",
  "Cassandra",
  "Redis",
  "CouchDB",
  "Firestore",
  "DynamoDB",
  "Elasticsearch",
  "Neo4j",
  "ArangoDB",
  "RethinkDB",
  "InfluxDB",
  "TimescaleDB",
  "ClickHouse",
  "ScyllaDB",
  "CockroachDB",
  "Aurora",
  "Memcached",
  "VoltDB",
  "IBM Db2",
  "Teradata",
  "OrientDB",
  "HBase",
  "Tarantool",
  "FoundationDB",
  "BigQuery",
  "Snowflake",
  "DuckDB",
  "FaunaDB",
  "HarperDB",
  "HyperSQL",
  "EdgeDB",
  "Hazelcast",
  "SurrealDB",
  "Dgraph",
];

function getRandomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomDelay(min = 1, max = 25) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function createRepository(repoName) {
  try {
    const response = await axios.post(
      "https://api.github.com/user/repos",
      {
        name: repoName,
        private: IS_PRIVATE,
        auto_init: true,
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    console.log(`✅ Repository created: ${response.data.html_url}`);
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.error(`❌ Gagal buat "${repoName}": ${message}`);
  }
}

async function createMultipleRepositories() {
  for (let i = 1; i <= TOTAL_REPOS; i++) {
    const repoName = `${getRandomWord()}-${i}`;
    await createRepository(repoName);

    const delayMs = getRandomDelay(1, 25); // Delay antara 1–25 ms
    console.log(`⏳ Menunggu ${delayMs} ms sebelum lanjut...`);
    await delay(delayMs);
  }
}

createMultipleRepositories();
