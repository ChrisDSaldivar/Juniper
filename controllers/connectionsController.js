
const redisClient        = require('redis').createClient();
const {promisify}        = require('util');

// promisify stuff
redisClient.get = promisify(redisClient.get);
redisClient.lrange = promisify(redisClient.lrange);
redisClient.exists = promisify(redisClient.exists);
redisClient.hset   = promisify(redisClient.hset);

class ConnectionController {
    constructor () {
        this.connections = {};
        /* 
            We use this object to simplify the API.
            it uses the client's ID as a key and
            the value is the info associated with that id
            id: {
                courseUUID,
                role,
            }
            Essentially it makes it easy to look up the course number and role
            of a target when we want to send a message. This way our client only 
            needs to send us the target's id.
        */
       this.info = {};
    }

    async addConnection (ws) {
        // extract session data from ws
        const {courseUUID, role, id, firstName, lastName} = ws;
        console.log(courseUUID)
        console.log(role)
        console.log(id)
        await redisClient.hset(id, 'firstName', firstName);
        await redisClient.hset(id, 'lastName', lastName);
        
        if (this.connections[courseUUID] === undefined) { // if the course doesn't exist yet
            this.addCourse(courseUUID);                   // then create it
        }

        // setup our lookup table
        this.info[id] = {
            courseUUID: courseUUID,
            role: role
        };

        // add the socket to our connections  already exists then 
        // this will just replace the old one
        this.connections[courseUUID][role][id] = ws;
        console.log("New Connection");
        console.log(this);
    }

    // helper function to create our course object
    // I really wish JS had a defaultdict like python
    addCourse (courseUUID) {
        this.connections[courseUUID] = {
            proctor: {},
            student: {}
        };
    }

    // target should be the target ID
    // msg should be an object
    send (msg, target) {
        // if the target doesn't exist then exit
        if (!this.info[target]) { console.log("target doesn't exist"); return; }

        // get the target's info so we an get their ws
        const { courseUUID, role } = this.info[target];
        // get the target's socket
        const socket = this.connections[courseUUID][role][target];

        // if it's open then send the message; otherwise remove the ws and info
        if (socket.isOpen()) {
            socket.send(JSON.stringify(msg));
        } else if (socket.isClosed()) { // socket can be in 4 states so: !isOpen() !== isClosed() since it can be in the connecting or closing states
            this.remove(socket);
        }
    }

    // just pass the ws on close
    remove (ws) {
        const {courseUUID, role, id} = ws;
        delete this.info[id];
        delete this.connections[courseUUID][role][id];
    }

    getStudentIDs (courseUUID) {
        let studentIDs = [];
        if (this.connections[courseUUID]) {
            studentIDs = Object.keys(this.connections[courseUUID].student);
        }
        return studentIDs;
    }
}

module.exports = new ConnectionController();