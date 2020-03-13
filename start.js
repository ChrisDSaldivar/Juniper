require('dotenv').config({ path: 'config.env' });
const WebSocket = require('ws');
const app       = require('./app');
const redisClient = require('redis').createClient();

const clients = [];

app.set('port', process.env.PORT || 9090);

const server = app.listen(app.get('port'), () => {
    console.log(`Express running → PORT ${server.address().port}`);
});

const wsServer = new WebSocket.Server({
    noServer: true,
})

wsServer.on('connection', function connection (ws, req) {
    const firstName = req.session.firstName;
    ws.firstName = firstName;
    clients.push(ws);
    console.log(`Current clients: ${clients.length}`)
    
    ws.on('message', function incoming (message) {
        console.log(`received: ${message} from: ${firstName}`);
        ws.send(JSON.stringify({cmd: 'broadcast'}));
    });

    ws.on('close', (client) => {
        redisClient.lrem(`students-${req.session.courseNumber}`,"1",`${req.session.firstName} ${req.session.lastName}`);
        let clientIndex = clients.indexOf(client);
        clients.splice(clientIndex, 1);
        console.log(`Remaining clients: ${clients.length}`);
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