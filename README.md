<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

### With Doppler + Docker (Recommended)

1. **Install Doppler**

   ```bash
   brew install dopplerhq/cli/doppler  # macOS
   ```

2. **Login & Setup**

   ```bash
   doppler login
   doppler setup  # select your project/environment
   ```

3. **Run Docker**

   ```bash
   # Development
   doppler run --mount docker-compose.yml --mount-template doppler-docker-compose.yml --command 'docker-compose up api-dev dynamodb redis'

   # Local
   doppler run --mount docker-compose.yml --mount-template doppler-docker-compose.yml --command 'docker-compose up api-local dynamodb redis'

   # Production
   doppler run --mount docker-compose.yml --mount-template doppler-docker-compose.yml --command 'docker-compose up api-prod redis'

   # Stop
   docker-compose down
   ```

### Direct Node.js

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Required Environment Variables

Add these to your Doppler project:

**Core App**

- `NODE_ENV`, `REDIRECT_URL`, `JSON_RPC_URL`, `CHAIN_ID`
- `API_DOMAIN_NAME`, `SUPPORT_EMAIL`, `SES_SENDER`

**Secrets**

- `SUMSUB_API_APP_TOKEN`, `SUMSUB_API_SECRET_KEY`
- `BRIDGE_API_KEY`, `BRIDGE_URL`, `BRIDGE_WEBHOOK_PUBLIC_KEY`
- `PERSONA_API_TOKEN`, `PERSONA_INQUIRY_TEMPLATE_ID`
- `ALCHEMY_API_KEY`, `ALCHEMY_AUTH_TOKEN`
- `REDIS_HOST`, `REDIS_PORT`
- `BULL_BOARD_USERNAME`, `BULL_BOARD_PASSWORD`
- `PRIVY_APP_ID`, `PRIVY_TOKENS_PUBLIC_KEY`

**AWS**

- `KMS_KEY_ID`, `EVENT_BUS_NAME`
- `TAX_FORMS_BUCKET_NAME`, `USER_AVATAR_BUCKET_NAME`
- `GRAPHQL_API_URL`

## Troubleshooting

- **"doppler: command not found"** → Install Doppler CLI
- **"No project configured"** → Run `doppler setup`
- **Missing variables** → Add them to your Doppler project
- **Permission denied** → Check Doppler project access

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

## Publish api package

Easiest way to publish api package is to change version in 3 files

1. getrewards-api/package.json - line 3
2. getrewards-api/package-lock.json - line 3 and 9
3. package.json - line 3

Then open terminal. Go to root of the project vaultleap-backend and run commands one by one

```
npm install
git commit -m "Publish api"
git tag @KLYDO-io/getrewards-backend-api@v{version}
```

where {version} needs to be replaced with actual app version.
Then you need to run command

```
git push origin -u master && git push --tags
```

to push latest commit and tag to github so the package publication will be triggered automatically

# Deployments

Requirements: need to have installed AWS CLI and AWS SAM CLI. Also needs to have configured AWS_PROFILE

Developer needs to have configured two profiles. One for stage AWS and one for prod AWS.

If you're using sso login for prod AWS, you'll need to run commands one by one

```
export AWS_PROFILE={name of AWS profile for prod}
aws sso login
```

Then website will be opened. Go through process on this website

## Deploy to stage

Open terminal. Go to root of the project vaultleap-backend and run commands one by one

```
npm install
export AWS_PROFILE={name of AWS profile for stage}
make stage-upload
```

Then you need to open vaultleap-infrastructure repository and you need to run command

```
export AWS_PROFILE={name of AWS profile for stage}
make stage-deploy
```

## Deploy to production

Open terminal. Go to root of the project vaultleap-backend and run commands one by one

```
npm install
export AWS_PROFILE={name of AWS profile for prod}
make prod-upload
```

Then you need to open vaultleap-infrastructure repository and you need to run command

```
export AWS_PROFILE={name of AWS profile for prod}
make prod-deploy
```
