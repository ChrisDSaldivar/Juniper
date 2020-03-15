require('dotenv').config({ path: 'config.env' });
const WebSocket = require('ws');
const app       = require('./app');
const uuidV4    = require('uuid').v4;

/************************************************
* 
*    THIS IS DUMB FIX IT!!!!!
* 
*************************************************/

// Clears the redis datastore because I wrote dumb code
// that isn't handling sessions properly
// it saves the students that have logged in (they have valid sessions)
// but it sends back the whole list of authenticated students 
// when it should send back only authenticated students who have open
// websocket connections. essentially I need the connections object
// it works even when they reload or navigate away (because on connection it replace the ws in connections)
// const redisClient = require('redis').createClient();
// redisClient.flushall();

/************************************************
* 
*    THAT WAS DUMB FIX IT!!!!!
* 
*************************************************/

const clients = [];
const connections = {};

app.set('port', process.env.PORT || 9090);

const server = app.listen(app.get('port'), () => {
    console.log(`Express running → PORT ${server.address().port}`);
});

const wsServer = new WebSocket.Server({
    noServer: true,
})

wsServer.on('connection', function connection (ws, request) {
    const firstName = request.session.firstName;
    ws.firstName = firstName;
    ws.id = request.session.uuid;
    clients.push(ws);
    connections[ws.id] = ws;
    console.log(Object.keys(connections));
    ws.on('message', function incoming (message) {
        const msg = JSON.parse(message);
        if (msg.cmd === 'candidate') {
            candidate(ws, msg)
        } else if (msg.cmd === 'offer') {
            offer(ws, msg);
        } else if (msg.cmd === 'answer') {
            answer(ws, msg);
        }
        console.log(`\nreceived: ${JSON.stringify(msg, null, 2)} from: ${firstName}`);
    });
});


/* 
 Handle the HTTP upgrade ourselves so we can capture the request object's session property
 Then we pass it by emitting the connection event ourselves so we have access to the request
 in wsServer.on('connection'). From their we can access the ws session (although we won't receive
 updates to the session unless the user reloads
*/
server.on('upgrade', function(request, socket, head) {
    app.get('sessionParser')(request, {}, () => {
        if (!request.session.student && !request.session.instructor && !request.session.assistant) {
            socket.destroy();
            return;
        }
  
        console.log('Session is parsed!');
  
        wsServer.handleUpgrade(request, socket, head, function(ws) {
            wsServer.emit('connection', ws, request);
        });
    });
});


// send the offer to the target with the sender's
// id as their new target
function offer (ws, msg) {
    const res = {
        cmd: 'offer',
        target: ws.id,
        description: msg.description
    };
    console.log(`sending to: ${JSON.stringify(msg.target, null, 2)}`);
    connections[msg.target].send(JSON.stringify(res));
}

function answer (ws, msg) {
    const res = {
        cmd: 'answer',
        target: ws.id,
        description: msg.description
    };
    console.log(`sending to: ${JSON.stringify(msg.target, null, 2)}`);
    connections[msg.target].send(JSON.stringify(res));
}

function candidate (ws, msg) {
    const res = {
        cmd: 'candidate',
        target: ws.id,
        candidate: msg.candidate
    };
    console.log(`sending to: ${JSON.stringify(msg.target, null, 2)}`);
    connections[msg.target].send(JSON.stringify(res));
}

// io.sockets.on("connection", socket => {
//     socket.on("broadcaster", () => {
//       broadcaster = socket.id;
//       socket.broadcast.emit("broadcaster");
//     });
//     socket.on("watcher", () => {
//       socket.to(broadcaster).emit("watcher", socket.id);
//     });
//     socket.on("offer", (id, message) => {
//       socket.to(id).emit("offer", socket.id, message);
//     });
//     socket.on("answer", (id, message) => {
//       socket.to(id).emit("answer", socket.id, message);
//     });
//     socket.on("candidate", (id, message) => {
//       socket.to(id).emit("candidate", socket.id, message);
//     });
//     socket.on("disconnect", () => {
//       socket.to(broadcaster).emit("disconnectPeer", socket.id);
//     });
// });

// function broadcaster (id, candidate) {
//     broadcaster = id;
//     socket.to(id).emit("candidate", socket.id, message);
// }