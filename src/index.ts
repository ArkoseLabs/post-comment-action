import * as core from '@actions/core'
import { context, getOctokit } from '@actions/github'
import { GitHub } from '@actions/github/lib/utils'
import * as glob from '@actions/glob'
import { readFileSync } from 'fs'

function getOptions(): any {
  const skipLabel = core.getInput('skip-label')
  const paths = core.getMultilineInput('path')
  const content = core.getInput('content')
  const header = core.getInput('header')
  const footer = core.getInput('footer')
  let owner = core.getInput('owner')
  let repo = core.getInput('repo')
  let issue_number: string | number = core.getInput('issue-number')

  if (repo.indexOf('/') !== -1) {
    [ owner, repo ] = repo.split('/', 2)
  }
  if (!owner || !repo) {
    throw new Error('owner and repo must be specified.')
  }

  if (issue_number) {
    issue_number = parseInt(issue_number)
  }
  else if (context.issue) {
    issue_number = context.issue.number
  }
  else {
    throw new Error('No issue number specified')
  }

  return {
    paths,
    content,
    header,
    footer,
    skipLabel,
    owner,
    repo,
    issue_number,
  }
}

async function run(): Promise<void> {
  try {
    const repoToken = core.getInput('repo-token', { required: true })
    const client = getOctokit(repoToken)
    const options = getOptions()

    await new Action(client, options).maybeCreateComment()
  }
  catch (error: any) {
    core.debug(error.stack)
    core.setFailed(error.message)
  }
}

class Action {
  readonly client: InstanceType<typeof GitHub>
  readonly options: any

  constructor(client: InstanceType<typeof GitHub>, options: any) {
    this.client = client
    this.options = options
  }

  async createComment(): Promise<void> {
    const body = await this.getBody()
    const posted = body !== ''

    if (posted) {
      const { owner, repo, issue_number } = this.options
      core.debug(`Creating comment on: ${owner}/${repo}/issues/${issue_number}`)
      const comment = await this.client.rest.issues.createComment({
        owner,
        repo,
        issue_number,
        body,
      })
      core.info(`Created comment: #${comment.data.id}`)
      core.setOutput('comment-id', comment.data.id)
    }
    else {
      core.info('Comment is empty. Skipped.')
    }

    core.setOutput('posted', posted)
  }

  async maybeCreateComment(): Promise<void> {
    const { skipLabel } = this.options
    const issue = await this.getIssue()
    const labels = issue.labels.map((label: any) => label.name)

    if (labels.includes(skipLabel)) {
      core.info(`Label "${skipLabel}" is applied. Skipped.`)
      core.setOutput('posted', false)
      return
    }

    return await this.createComment()
  }

  async getIssue(): Promise<any> {
    const { owner, repo, issue_number } = this.options
    core.debug(`Fetching issue: ${owner}/${repo}/issues/${issue_number}`)
    const issue = await this.client.rest.issues.get({ owner, repo, issue_number })
    core.info(`Fetched issue: #${issue.data.number}`)
    return issue.data
  }

  async getContent(): Promise<string> {
    let { content, paths } = this.options

    if (!content && paths.length) {
      const globber = await glob.create(paths.join("\n"))
      content = ''
      for await (const file of globber.globGenerator()) {
        core.debug(`Reading file: ${file}`)
        content = `${content}\n` + readFileSync(file, 'utf8');
      }
    }

    return content
  }

  async getBody(): Promise<string> {
    const { header, footer } = this.options
    const content = await this.getContent()

    if (!content) {
      return ''
    }

    return [header, content, footer]
      .filter(x => x)
      .join("\n")
  }
}

void run()
