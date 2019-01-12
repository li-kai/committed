# Committed

Committed is a commit linter, changelog generator, git hooks manager and package release tool all in one.

## Why?

Changelogs are hard to maintain and enforcing their updates are even harder. Committed enables every contributor to produce a good commit message that is relevant to a changelog, which further enables automation of package release.

## How?

Committed follows [conventional commits](https://www.conventionalcommits.org/en/v1.0.0-beta.2/).

Through such enforcements, Committed can also generate changelogs, update versions accordingly, and run automate package publishing.

## Managing monorepos with yarn

[Yarn Workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) are a great solution to monorepos. This allows Committed to come in and replace previous tools like [lerna](https://github.com/lerna/lerna) and [bolt](https://github.com/boltpkg/bolt).

## FAQ

### Isn't this tool too opinionated?

Yes, if there is interest in allowing more configuration, please feel welcome to contribute.

## Also see

[Semantic Release](https://github.com/semantic-release/semantic-release)
[Conventional Changelog](https://github.com/conventional-changelog/conventional-changelog)
[Commitlint](https://github.com/marionebl/commitlint)
[Commitizen](https://github.com/commitizen/cz-cli)
[Husky](https://github.com/typicode/husky)
