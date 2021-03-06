import http from 'http';
import { Server } from 'socket.io';
import express from 'express';
import { Http2ServerRequest } from 'http2';
import path from 'path';
import { instrument } from '@socket.io/admin-ui';
const __dirname = path.resolve();

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/src/views');
app.use('/public', express.static(__dirname + '/src/public'));
app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {   //admin-ui를 사용하기위한 세팅
    cors: {
        origin: ['https://admin.socket.io'],
        credentials: true,
    },
});
instrument(wsServer, {      //admin-ui를 사용하기위한 세팅
    auth: false,    //여기서 비밀번호 세팅할 수 있음
});

wsServer.on("connection", socket =>{
    socket.on("join_room", (roomName) => {
        socket.join(roomName);
        socket.to(roomName).emit("welcome");
    });
    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
    })
    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    })
    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice", ice)
    })
})

// 여기서부터 socket io를 활용한 채팅기능
// function publicRooms() {
//     const {
//         sockets: {
//             adapter: { sids, rooms },
//         },
//     } = wsServer;
//     const publicRooms = [];
//     rooms.forEach((_, key) => {
//         if (sids.get(key) === undefined) {
//             publicRooms.push(key);
//         }
//     });
//     return publicRooms;
// }

// function countRoom(roomName) {
//     return wsServer.sockets.adapter.rooms.get(roomName)?.size;
// }

// wsServer.on('connection', (socket) => {
//     socket['nickname'] = 'Anon';
//     socket.onAny((event) => {
//         console.log(wsServer.sockets.adapter);
//         console.log(`Socket Event:${event}`);
//     });
//     socket.on('enter_room', (roomName, done) => {
//         socket.join(roomName);
//         done(); //★ 이 done 코드는 백엔드에서 실행하지 않고, 프론트엔드에서 실행한다.(보안상의 이유로)
//         socket.to(roomName).emit('welcome', socket.nickname, countRoom(roomName));
//         wsServer.sockets.emit('room_change', publicRooms());
//     });
//     socket.on('disconnecting', () => {
//         //disconnecting event는 socket이 방을 떠나기 바로 직전 발생
//         socket.rooms.forEach((room) =>
//             socket.to(room).emit('bye', socket.nickname, countRoom(room) - 1)
//         );
//     });
//     socket.on('disconnect', () => {
//         wsServer.sockets.emit('room_change', publicRooms());
//     });
//     socket.on('new_message', (msg, room, done) => {
//         socket.to(room).emit('new_message', `${socket.nickname}: ${msg}`);
//         done();
//     });
//     socket.on('nickname', (nickname) => (socket['nickname'] = nickname));
// });


const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
