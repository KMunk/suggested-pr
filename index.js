const core = require('@actions/core');
const github = require('@actions/github');

async function run(){
    try{
        const githubToken = core.getInput('GITHUB_TOKEN');
        const owner = core.getInput('owner');
        const repo = core.getInput('repo');
        const context = github.context;
        
        if (context.payload.pull_request == null) {
          core.setFailed('No pull request found.');
          return;
        }
        const pullRequestNumber = context.payload.pull_request.number;
        const headRef = `${owner}:${context.payload.pull_request.head.ref}`
    
        const octokit = new github.getOctokit(githubToken);
        
        const { data: pullRequests } = octokit.rest.pulls.list({
            owner: owner,
            repo: repo,
            state: 'open',
            head: headRef
        });
    
        if(pullRequests != null){
            let message = "Possible Related Pull Requests:<br/>"
            pullRequests.forEach((pr) =>{
                message += `${pr.url}<br/>`
            });
    
            octokit.issues.createComment({
                ...context.repo,
                issue_number: pullRequestNumber,
                body: message
              });
        }
    
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();