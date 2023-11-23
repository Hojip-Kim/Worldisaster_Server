서버가 돌아가는 상황에서 아래 client들을 돌려서 테스트 가능함
순서대로 돌리는게 좋고, DB에 저장되는것도 확인 가능
Chat History는 /chat/room/{roomnumber} API GET으로 채워야 하며,
아래 Client 스크립트를 돌리기 위해서는 npm install socket.io-client 설치를 해줘야 함
서버에는 불필요한 라이브러리라서 현재 설치된 상태가 아니고, 파일들 따로 가져다 테스트 권장

From CLI, in order:
node client1.js
node client2.js
node client3.js