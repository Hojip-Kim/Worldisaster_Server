서버가 돌아가는 상황에서 아래 client들을 돌려서 테스트 가능함
순서대로 돌리는게 좋고, DB에 저장되는것도 확인 가능

프론트에서 필요한 Chat History는 /chat/room/{roomnumber} API GET으로 채워야 함

Nest.js 백엔드 서버에는 불필요한 라이브러리라서 현재 설치된 상태가 아니고, 파일들 따로 가져다 테스트 권장
로컬머신에 별도의 프로젝트를 만들고, npm init -y 및 npm install socket.io-client 실행

From CLI, in order:
node chat_client1.js
node chat_client2.js
node chat_client3.js