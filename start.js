require('dotenv').config({ path: 'config.env' });
const WebSocket = require('ws');
const app       = require('./app');

app.set('port', process.env.PORT || 9090);

const server = app.listen(app.get('port'), () => {
    console.log(`Express running → PORT ${server.address().port}`);
});

const wsServer = new WebSocket.Server({
    server
})

wsServer.on('connection', function connection (ws) {
    ws.on('message', function incoming (message) {
        console.log(`received: ${message}`);
        ws.send('PONG');
    });
  
});