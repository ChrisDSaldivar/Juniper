
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
        // console.log(courseUUID)
        // console.log(role)
        // console.log(id)
        await redisClient.hset(id, 'firstName', firstName);
        await redisClient.hset(id, 'lastName', lastName);
        
        if (this.connections[courseUUID] === undefined) { // if the course doesn't exist yet
            this.addCourse(courseUUID);                   // then create it
        }

        // setup our lookup table
        this.info[id] = {
            courseUUID,
            role,
            firstName,
            lastName
        };

        // add the socket to our connections  already exists then 
        // this will just replace the old one
        this.connections[courseUUID][role][id] = ws;
        if (role === "student") {
            this.updateProctors(courseUUID);
        }
        // console.log("New Connection");
        // console.log(this);
    }

    // helper function to create our course object
    // I really wish JS had a defaultdict like python
    addCourse (courseUUID) {
        this.connections[courseUUID] = {
            proctor: {},
            student: {},
            questions: {},
            freeProctors: {}, // This holds UUIDs of proctors that are waiting to help students
        };
    }

    addFreeProctor (proctorUUID, courseUUID, ws) {
        if (!this.connections[courseUUID]) {
            this.addCourse(courseUUID);
        }
        this.connections[courseUUID].freeProctors[proctorUUID] = ws;
    }

    sendQuestions (courseUUID) {
        if (this.connections[courseUUID]) {
            const questions = this.connections[courseUUID].questions;
            const proctors = this.connections[courseUUID].freeProctors;
            for (const proctorUUID in proctors) {
                const socket = proctors[proctorUUID];
                if (socket.isOpen()) {
                    proctors[proctorUUID].send(JSON.stringify({questions}));
                } else if (socket.isClosed()) { 
                    this.remove(socket);
                }
            }
        }
    }

    addQuestion (courseUUID, studentUUID) {
        if (this.studentInCourse(courseUUID, studentUUID)) {
            const questions = this.connections[courseUUID].questions;
            questions[studentUUID] = {};
            return true;
        }
        return false;
    }

    removeQuestion (courseUUID, studentUUID) {
        if (this.studentInCourse(courseUUID, studentUUID)) {
            delete this.connections[courseUUID].questions[studentUUID];
            this.sendQuestions(courseUUID);
        }
    }

    getQuestions (courseUUID) {
        let questions = [];
        if (this.connections[courseUUID]) {
            questions = Object.keys(this.connections[courseUUID].questions);
        }
        return questions;
    }

    studentInCourse (courseUUID, studentUUID) {
        return this.connections[courseUUID] && this.connections[courseUUID].student[studentUUID];
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
        this.removeQuestion(courseUUID, id);
        delete this.info[id];
        delete this.connections[courseUUID][role][id];
        if (role === "student") {
            this.updateProctors(courseUUID);
        }
    }

    getStudentIDs (courseUUID) {
        let studentIDs = [];
        if (this.connections[courseUUID]) {
            studentIDs = Object.keys(this.connections[courseUUID].student);
        }
        return studentIDs;
    }


    getConnectedStudents (courseUUID) {
        const studentInfo = {};
        const studentIDs = this.getStudentIDs(courseUUID);
        for (const studentID of studentIDs) {
            const {firstName, lastName} = this.info[studentID];
            studentInfo[studentID] = {firstName, lastName};
        }
        return studentInfo;
    }

    sendConnectedStudents (courseUUID) {
        const studentInfo = this.getConnectedStudents(courseUUID);
        const proctors = this.connections[courseUUID].freeProctors;
        for (const proctorUUID in proctors) {
            const socket = proctors[proctorUUID];
            if (socket.isOpen()) {
                proctors[proctorUUID].send(JSON.stringify({studentInfo}));
            } else if (socket.isClosed()) { 
                this.remove(socket);
            }
        }
    }

    updateProctors (courseUUID) {
        this.sendConnectedStudents(courseUUID);
        this.sendQuestions(courseUUID);
    }
}

module.exports = new ConnectionController();