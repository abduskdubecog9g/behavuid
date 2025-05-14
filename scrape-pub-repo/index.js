const axios = require('axios');
const fs = require('fs');

async function getPublicRepos(username) {
    let page = 1;
    let repos = [];
    
    try {
        while (true) {
            const url = `https://api.github.com/users/${username}/repos?per_page=100&page=${page}`;
            const response = await axios.get(url);
            if (response.data.length === 0) break;
            repos = repos.concat(response.data);
            page++;
        }
        
        const repoNames = repos.map(repo => `"${username}/${repo.name}",`).join('\n');
        
        fs.writeFileSync(`${username}_repos.txt`, repoNames);
        console.log(`Repositories saved to ${username}_repos.txt`);
    } catch (error) {
        console.error(`Error: Unable to fetch repositories for ${username}`);
    }
}

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question("Enter GitHub username: ", username => {
    getPublicRepos(username);
    readline.close();
});
