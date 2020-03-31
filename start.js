require('dotenv').config({ path: 'config.env' });
global.__basedir = __dirname;

const WebSocket = require('ws');
const app       = require('./app');
const connections = require('./controllers/connectionsController');
const url         = require('url');
const CourseModel = new (require('./models/courseModel'));

app.set('port', process.env.PORT || 9090);

const server = app.listen(app.get('port'), () => {
    console.log(`Express running → PORT ${server.address().port}`);
});

const courseConnectionWSS = new WebSocket.Server({
    noServer: true,
});

const courseScreensWSS = new WebSocket.Server({
    noServer: true,
});

/* 
 Handle the HTTP upgrade ourselves so we can capture the request object's session property
 Then we pass it by emitting the connection event ourselves so we have access to the request
 in courseConnectionWSS.on('connection'). From their we can access the ws session (although we won't receive
 updates to the session unless the user reloads
*/
server.on('upgrade', function(req, socket, head) {
    const path = url.parse(req.url).pathname;
    if (path === "/socket/screens") {
        app.get('sessionParser')(req, {}, () => {
            courseScreensWSS.handleUpgrade(req, socket, head, function(ws) {
                courseScreensWSS.emit('connection', ws, req);
            });
        });
    } else if (path === "/socket/course") {
        app.get('sessionParser')(req, {}, () => {
            courseConnectionWSS.handleUpgrade(req, socket, head, function(ws) {
                courseConnectionWSS.emit('connection', ws, req);
            });
        });
    } else {
        console.log(`Websocket attempt to connect to unsupported path: [${path}]`);
        socket.destroy();
    }
});

courseScreensWSS.on('connection', async function connection (ws, req) {
    const {uuid, courseUUID, isInstructor} = req.session;
    if (!(await CourseModel.authorizedProctor(uuid, courseUUID, isInstructor))) {
        ws.close();
        return;
    }
    
    ws.on('close', () => connections.remove(ws));
    // Utility functions
    ws.isOpen   = function () { return this.readyState === 1;};
    ws.isClosed = function () { return this.readyState === 3;};

    addSessionStateToSocket(ws, req.session);
    connections.addFreeProctor(uuid, courseUUID, ws);
    connections.updateProctors(courseUUID);
});

courseConnectionWSS.on('connection', function connection (ws, req) {
    if (!req.session.student && !req.session.instructor && !req.session.proctor) {
        ws.close();
        return;
    }
    addSessionStateToSocket(ws, req.session);

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
        console.log(`\nreceived: ${JSON.stringify(msg, null, 2)} from: ${ws.firstName}`);
    });
    // console.log('\nNew Connection:')
    // console.log(connections);
    // console.log();
    ws.on('close', () => {connections.remove(ws);});

    // Utility functions
    ws.isOpen   = function () { return this.readyState === 1;};
    ws.isClosed = function () { return this.readyState === 3;};
});

function addSessionStateToSocket (ws, session) {
    ws.firstName  = session.firstName;
    ws.lastName   = session.lastName;
    ws.id         = session.uuid;
    ws.courseUUID = session.courseUUID;
    ws.role       = session.role;

}

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
    connections.send(res, msg.target);
}

function answer (ws, msg) {
    const res = {
        cmd: 'answer',
        target: ws.id,
        description: msg.description,
        video: msg.video,
    };
    console.log(`sending to: ${JSON.stringify(msg.target, null, 2)}`);
    connections.send(res, msg.target);
}

function candidate (ws, msg) {
    const res = {
        cmd: 'candidate',
        target: ws.id,
        candidate: msg.candidate,
        video: msg.video
    };
    console.log(`sending to: ${JSON.stringify(msg.target, null, 2)}`);
    connections.send(res, msg.target);
}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});
  
rl.on('line', function(line){
    if (line == "connections") {
        console.log(connections)
    }
})