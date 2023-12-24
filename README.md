#Worldisaster

---
# 🗓 **프로젝트 소개**

**WorlDisaster**에 오신 것을 환영합니다. 이 서비스는 일상에서 방해 요소를 줄이고, 원하는 정보만을 빠르게 제공하여 재해 위험에 대비할 수 있도록 도와줍니다.

- 살고 있거나 관심 있는 지역의 원하는 범위와 규모를 설정하여, 오프라인 시 이메일로, 온라인 시 화면 알림으로 정보를 받을 수 있는 서비스입니다.
- 3D 지구 모델과 핀을 활용한 동적인 UI로, 한 페이지 내에서 재난에 대한 모든 정보를 제공합니다.

## 📌 주요 기능

<table>
  <tr>
    <td align="center">
      <h3><b>📌 1. 재난 상세 정보 및 관련 뉴스기사 제공</b></h3>
      <img src="https://github.com/Hojip-Kim/Worldisaster_Server/assets/101489057/48985a8d-fc86-43ba-b4c5-358b144e999b" width="400px" />
    </td>
    <td align="center">
      <h3><b>📌 2. 재난 유형별 필터링 및 연도별 아카이빙</b></h3>
      <img src="https://github.com/Hojip-Kim/Worldisaster_Server/assets/101489057/5162b96e-4a1d-439a-8820-bfe210a4874a" width="400px" />
    </td>
  </tr>
  <tr>
    <td align="center">
      <h3><b>📌 3. 실시간 재난 알림 서비스 (온라인)</b></h3>
      <img src="https://github.com/Hojip-Kim/Worldisaster_Server/assets/101489057/17f774ba-4b7c-4fb8-81a2-c74ddcb4c00d" width="400px" />
    </td>
    <td align="center">
      <h3><b>📌 4. 실시간 재난 알림 구독 서비스 (오프라인 - Gmail)</b></h3>
      <img src="https://github.com/Hojip-Kim/Worldisaster_Server/assets/101489057/e8536f85-ac2a-4bdc-97f1-c88f37930105" width="400px" />
    </td>
  </tr>
</table>

## 📌 추가 서비스

<h2 align="center">영상 업로드 및 스트리밍 | 뉴스기사 | 채팅 | 후원 (Paypal)</h2>

<p align="center">
  <img src="https://github.com/Hojip-Kim/Worldisaster_Server/assets/101489057/d661acbf-4493-49c6-a359-c7324c67b483" alt="영상 업로드 및 스트리밍" width="150" />
  <img src="https://github.com/Hojip-Kim/Worldisaster_Server/assets/101489057/7d5cb692-4205-48c8-b9d5-db86ca35cf62" alt="뉴스기사" width="150" />
  <img src="https://github.com/Hojip-Kim/Worldisaster_Server/assets/101489057/f3e51a1e-e7b1-408b-a508-cd8beef8dc42" alt="채팅 서비스" width="150" />
  <img src="https://github.com/Hojip-Kim/Worldisaster_Server/assets/101489057/2e969393-9eec-4c04-9416-0b934fafe994" alt="Paypal을 통한 후원" width="150" />
  <img src="https://github.com/Hojip-Kim/Worldisaster_Server/assets/101489057/aee37d33-f2fe-4788-beae-06d8159b57ec" alt="추가 기능" width="150" />
</p>

## 📌 아키텍처

<p align="center">
<img width="609" alt="스크린샷 2023-12-25 오전 2 51 32" src="https://github.com/Hojip-Kim/Worldisaster_Server/assets/101489057/0a150dab-a835-4271-9aef-1158f3132aa0">
</p>

---

# **[  🗓  Project Rules & DOCS  ]**

### **📌 Directory Structure**

    📦Worldisaster_Server
     ┃  ┣ 📂src
     ┃  ┃ ┣ 📂archieveNews
     ┃  ┃ ┣ 📂auth
     ┃  ┃ ┣ 📂chat
     ┃  ┃ ┣ 📂configs
     ┃  ┃ ┣ 📂country
     ┃  ┃ ┣ 📂emailAlerts
     ┃  ┃ ┣ 📂liveNews
     ┃  ┃ ┣ 📂newDisasters
     ┃  ┃ ┣ 📂oldDisasters
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
