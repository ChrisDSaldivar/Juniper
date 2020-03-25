
const redisClient        = require('redis').createClient();
const {promisify}        = require('util');
const uuidV4             = require('uuid').v4;

// promisify stuff
redisClient.get = promisify(redisClient.get);
redisClient.lrange = promisify(redisClient.lrange);
redisClient.exists = promisify(redisClient.exists);

class ConnectionController {
    constructor () {
        this.connections = {};
        /* 
            We use this object to simplify the API.
            it uses the client's ID as a key and
            the value is the info associate with that id
            id: {
                courseNumber,
                role,
            }
            Essentially it makes it easy to look up the coursenumber and role
            of a target when we want to send a message. This way our client only 
            needs to send us the target's id.
        */
       this.info = {};
    }

    addConnection (ws) {
        // extract session data from ws
        const {courseNumber, role, id} = ws;
        
        if (this.connections[courseNumber] === undefined) { // if the course doesn't exist yet
            this.addCourse(courseNumber);                   // then create it
        }
        // setup our lookup table
        this.info[id] = {
            courseNumber: courseNumber,
            role: role
        };

        // add the socket to our connections  already exists then 
        // this will just replace the old one
        this.connections[courseNumber][role][id] = ws;
    }

    // helper function to create our course object
    // I really wish JS had a defaultdict like python
    addCourse (courseNumber) {
        this.connections[courseNumber] = {
            proctors: {},
            students: {}
        };
    }

    // target should be the target ID
    // msg should be an object
    send (msg, target) {
        // if the target doesn't exist then exit
        if (!this.info[target]) { return; }

        // get the target's info so we an get their ws
        const { courseNumber, role } = this.info[target];
        // get the target's socket
        const socket = this.connections[courseNumber][role][target];

        // if it's open then send the message; otherwise remove the ws and info
        if (socket.isOpen()) {
            socket.send(JSON.stringify(msg));
        } else if (socket.isClosed()) { // socket can be in 4 states so: !isOpen() !== isClosed() since it can be in the connecting or closing states
            delete this.info[target];
            delete this.connections[courseNumber][role][targer];
        }
    }

    // just pass the ws on close
    remove (ws) {
        const {courseNumber, role, id} = ws;
        delete this.info[id];
        delete this.connections[courseNumber][role][id];
    }

    getStudentIDs (courseNumber) {
        let studentIDs = [];
        if (this.connections[courseNumber]) {
            studentIDs = Object.keys(this.connections[courseNumber].student);
        }
        return studentIDs;
    }
}

module.exports = new ConnectionController();