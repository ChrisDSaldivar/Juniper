require('dotenv').config({ path: 'config.env' });
global.__basedir = __dirname;

const WebSocket = require('ws');
const app       = require('./app');
const uuidV4    = require('uuid').v4;
const connections = require('./controllers/connectionsController');

app.set('port', process.env.PORT || 9090);

const server = app.listen(app.get('port'), () => {
    console.log(`Express running → PORT ${server.address().port}`);
});

const wsServer = new WebSocket.Server({
    noServer: true,
});

/* 
 Handle the HTTP upgrade ourselves so we can capture the request object's session property
 Then we pass it by emitting the connection event ourselves so we have access to the request
 in wsServer.on('connection'). From their we can access the ws session (although we won't receive
 updates to the session unless the user reloads
*/
server.on('upgrade', function(request, socket, head) {
    console.log(request.headers)
    app.get('sessionParser')(request, {}, () => {
        wsServer.handleUpgrade(request, socket, head, function(ws) {
            wsServer.emit('connection', ws, request);
        });
    });
});

wsServer.on('connection', function connection (ws, request) {
    if (!request.session.student && !request.session.instructor && !request.session.proctor) {
        ws.close();
        return;
    }

    const firstName = request.session.firstName;
    ws.firstName = firstName;
    ws.id = request.session.uuid;
    ws.courseNumber = request.session.courseNumber;
    ws.role = request.session.role; // this doesn't exist yet

    connections.addConnection(ws);
    ws.on('message', function incoming (message) {
        const msg = JSON.parse(message);
        if (msg.cmd === 'candidate') {
            candidate(ws, msg);
        } else if (msg.cmd === 'offer') {
            offer(ws, msg);
        } else if (msg.cmd === 'answer') {
            answer(ws, msg);
        }
        console.log(`\nreceived: ${JSON.stringify(msg, null, 2)} from: ${firstName}`);
    });

    ws.on('close', () => {connections.remove(ws);});

    // Utility functions
    ws.isOpen   = () => {return this.readyState === 1;};
    ws.isClosed = () => { return this.readyState === 3;};
});

// send the offer to the target with the sender's
// id as their new target
function offer (ws, msg) {
    const res = {
        cmd: 'offer',
        target: ws.id,
        description: msg.description,
        video: msg.video
    };
    console.log(`sending to: ${JSON.stringify(msg.target, null, 2)}`);
    connections.send(JSON.stringify(res), msg.target);
}

function answer (ws, msg) {
    const res = {
        cmd: 'answer',
        target: ws.id,
        description: msg.description,
        video: msg.video,
    };
    console.log(`sending to: ${JSON.stringify(msg.target, null, 2)}`);
    connections.send(JSON.stringify(res), msg.target);
}

function candidate (ws, msg) {
    const res = {
        cmd: 'candidate',
        target: ws.id,
        candidate: msg.candidate,
        video: msg.video
    };
    console.log(`sending to: ${JSON.stringify(msg.target, null, 2)}`);
    connections.send(JSON.stringify(res), msg.target);
}