#Worldisaster

---

# **[  🗓  Project Rules & DOCS  ]**

### **📌 Directory Structure**

    📦Worldisaster_Server
     ┃  ┣ 📂src
     ┃  ┃ ┣ 📜app.controller.spec.ts
     ┃  ┃ ┣ 📜app.controller.ts
     ┃  ┃ ┣ 📜app.module.ts
     ┃  ┃ ┣ 📜app.service.ts
     ┃  ┃ ┗ 📜main.ts
     ┃  ┣ 📂test
     ┃  ┃ ┣ 📜app.e2e-spec.ts
     ┃  ┃ ┗ 📜jest-e2e.json
     ┣ 📜.eslintrc.js
     ┣ 📜.gitignore
     ┣ 📜.prettierrc
     ┣ 📜README.md
     ┣ 📜nest-cli.json
     ┣ 📜package-lock.json
     ┣ 📜package.json
     ┣ 📜tsconfig.build.json
     ┗ 📜tsconfig.json

---

### 📌 Early Settinged Module

    ┣ Class-validator
    ┣ Class-transformer
    ┣ @nestjs/typeorm : nestjs에서 typeorm을 사용하기위해 연동시켜주는 모듈
    ┣ Typeorm : typeORM 모듈
    ┣ Pg : postgres 모듈
    ┣ Bcryptjs
    ┣ @nestjs/jwt : nestjs에서 jwt를 사용하기 위해 필요한 모듈
    ┣ @nestjs/passport : nestjs에서 passport를 사용하기위해 필요한 모듈
    ┣ Passport : passport 모듈
    ┣ Passport-jwt : jwt모듈

    ┣ @nestjs/schedule : API를 주기적으로 스케쥴링
    ┣ @nextjs/axios : HTTP Request 생성
    ┣ axios
    ┣ @types/sanitize-html : HTML 태그 제거
    ┣ sanitize-html

```bash
$ npm install
```

---

### **:octocat:Commit Rule** ###
```
$ <type>(<scope>): <subject>    -- 헤더
  <BLANK LINE>                  -- 빈 줄
  <body>                        -- 본문
  <BLANK LINE>                  -- 빈 줄
  <footer>                      -- 바닥 글
```

📌 type은 해당 commit의 성격을 나타내며 아래 중 하나여야 함.

```
feat : 새로운 기능에 대한 커밋
fix : build 빌드 관련 파일 수정에 대한 커밋
build : 빌드 관련 파일 수정에 대한 커밋
chore : 그 외 자잘한 수정에 대한 커밋(rlxk qusrud)
ci : CI 관련 설정 수정에 대한 커밋
docs : 문서 수정에 대한 커밋
style : 코드 스타일 혹은 포맷 등에 관한 커밋
refactor : 코드 리팩토링에 대한 커밋
test : 테스트 코드 수정에 대한 커밋
```

**example**

```
Feat: 관심지역 알림 ON/OFF 기능 추가(#123)

시군구의 알림을 각각 ON/OFF 할 수 있도록 기능을 추가함
 - opnion0055: 구분 코드

해결: close #123
```

---
### 📌 Branch Strategy (Git Flow Strategy)

![스크린샷 2023-11-14 오후 2 48 18](https://github.com/Hojip-Kim/Worldisaster_Server/assets/101489057/e5d379d9-836e-4157-9dc0-8abc6c150050)


### Example Branch Shape
```
              ┏ Hojip
              ┃
main ━ dev┏━━━┣ Kiyeoung
          ┃   ┃
          ┃   ┗ YuJeong
          ┃
          ┗━━━━ (Optional)release
```

---

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

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

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
