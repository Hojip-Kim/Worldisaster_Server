// 문제해결에 하루 이상 걸린 이유가, 테스트 스크립트가 ws를 썼기 때문 -> socket.io를 쓰는 서버는 클라이언트도 그걸 써줘야함
// npm install socket.io-client
// https://blog.ewq.kr/40
// <script src="https://cdn.socket.io/3.1.3/socket.io.min.js" integrity="sha384-cPwlPLvBTa3sKAgddT6krw0cJat7egBga3DJepJyrLl4Q9/5WLra3rrnMcyTyOnh" crossorigin="anonymous"></script>

const io = require('socket.io-client');
const socket = io('https://worldisaster.com/api/alerts'); // Replace with your server address

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('disaster-alert', (message) => {
    console.log(message);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});