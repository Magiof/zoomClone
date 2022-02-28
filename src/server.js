import http from 'http';
import { WebSocketServer } from 'ws';
import express from 'express';
import { Http2ServerRequest } from 'http2';
import path from 'path';
const __dirname = path.resolve();

const app = express();

console.log('hello');

app.set('view engine', 'pug');
app.set('views', __dirname + '/src/views');
app.use('/public', express.static(__dirname + '/src/public'));
app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function onSocketClose() {
    console.log('Disconnected from the Browser ❌');
}

const sockets = [];

wss.on('connection', (socket) => {
    sockets.push(socket);
    socket['nickname'] = 'Anon';
    console.log('Connected to Browser ✅');
    socket.on('close', onSocketClose);
    socket.on('message', (msg) => {
        const message = JSON.parse(msg);
        switch (message.type) {
            case 'new_message':
                sockets.forEach((aSocket) =>
                    aSocket.send(`${socket.nickname}: ${message.payload}`)
                );
                break;
            case 'nickname':
                socket['nickname'] = message.payload;
                break;
        }
    });
});

server.listen(3000, handleListen);
