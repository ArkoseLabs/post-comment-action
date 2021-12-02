# post-comment-action
  Post a comment on an issue or pull request. The body of the comment can be
  passed or read from one or more files. If the body is empty then a comment
  wont be posted.

## All options

### List of input options

| Input                         | Description                                 | Default                    |
| ----------------------------- | ------------------------------------------- | -------------------------- |
| [repo-token](#repo-token)     | PAT for GitHub API authentication           | `${{ github.token }}`      |
| [issue-number](#issue-number) | The issue or pull request number            |                            |
| [owner](#owner)               | The repository owner                        |                            |
| [repo](#repo)                 | The repository name                         | `${{ github.repository }}` |
| [content](#content)           | The body of the comment                     |                            |
| [path](#path)                 | The path of the file containing the comment |                            |
| [header](#header)             | The comment header                          |                            |
| [footer](#footer)             | The comment footer                          |                            |
| [skip-label](#skip-label)     | Skips posting comment if label is present   | `no comment`               |

### List of output options

| Output                    | Description                                       |
| ------------------------- | ------------------------------------------------- |
| [comment-id](#comment-id) | The comment ID | `${{ github.token }}`            |
| [posted](#posted)         | A boolean indicating whether a comment was posted |

### Detailed options

#### repo-token

Personal Access Token (PAT) that allows the stale workflow to authenticate and perform API calls to GitHub.
Under the hood, it uses the [@actions/github](https://www.npmjs.com/package/@actions/github) package.

Default value: `${{ github.token }}`

#### issue-number

The issue or pull request number. If blank and the event is pull request it will use that.

#### owner

The repository owner. Defaults to current repository owner unless [repo](#repo) includes an owner.

#### repo

The repository name. Can also include the owner in the format `{{ owner }}/{{ repo }}`. Defaults to the current repository.

Default value: `${{ github.repository }}`

#### content

The body of the comment. If blank and [path](#path) is empty or file contents amount to being blank then no comment will be posted.

#### path

The path of the file containing the comment. Can be a list of files or a file glob. Multiple files will be concatenated together.

#### header

The header of the comment.

#### footer

The footer of the comment.

#### skip-label

Skips posting comment if label is present. Leave blank to disable.

Default value: `no comment`

#### comment-id

The ID of the comment created.

#### posted

A boolean indicating whether a comment was posted.

### Usage

See also [action.yml](./action.yml) for a comprehensive list of all the options.

Basic usage:

```yaml
jobs:
  comment:
    name: Comment
    runs-on: ubuntu-latest
    steps:
      - uses: ArkoseLabs/post-comment-action@v1
        with:
          header: "# Title"
          content: This is a comment
          footer: "*Footer*"
```
