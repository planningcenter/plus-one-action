const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require("@octokit/action");

async function run () {
  const octokit = new Octokit;
  const pull_number = github.context.payload.pull_request.number
  const owner = github.context.payload.repository.owner.login
  const repo = github.context.payload.repository.name


  const prReviews = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews', {
    owner,
    repo,
    pull_number
  })

  console.log(`reviews: ${JSON.stringify(prReviews, undefined, 2)}`)
  const approvedCount = prReviews.data
    .flatMap((review, i, {length}) => {
      if (length - 1 !== i) {
        return [{state: review.state, user: review.user.login }]
      } else {
        return []
      }
    })
    .filter(r => r.state == 'APPROVED')
    .length
  console.log(`There are ${approvedCount} approvals.`)

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