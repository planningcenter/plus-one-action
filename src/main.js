const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require("@octokit/action");

async function run () {
  const octokit = new Octokit;
  const pull_number = github.context.payload["pull_request"]["number"]
  console.log(`For pull request ${pull_number}`);

  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

  let { data } = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews', {
    owner,
    repo,
    pull_number
  })
  const commentCount = data.filter((d) => d["state"] === "COMMENTED").length
  const approvedCount = data.filter((d) => d["state"] === "APPROVED").length
  const rejectedCount = data.filter((d) => d["state"] === "REJECTED").length
  console.log(`There ${commentCount} comments, ${approvedCount} approvals, and ${rejectedCount} rejections.`)

  let { data: issue } = await octokit.request('GET /repos/{owner}/{repo}/issues/{pull_number}', {
    owner,
    repo,
    pull_number,
  }) 

  const labels = issue["labels"].map(l => l["name"])
  let filteredLabels = labels.filter((l) => !["+1", "+2"].includes(l))
  console.log(`Filtered labels: ${JSON.stringify(filteredLabels, undefined, 2)}`)

  if (approvedCount >= 2) {
    filteredLabels.push("+2")
  } else if (approvedCount == 1) {
    filteredLabels.push("+1")
  }
  console.log(`We are setting these labels ${JSON.stringify(filteredLabels, undefined, 2)}`)

  await octokit.request('PUT /repos/{owner}/{repo}/issues/{issue_number}/labels', {
    owner,
    repo,
    issue_number: pull_number,
    labels: filteredLabels,
  })
}
try {
  run()
} catch (error) {
  core.setFailed(error.message);
}