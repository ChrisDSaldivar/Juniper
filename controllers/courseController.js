// const Course           = require('../models/courseModel');
const {connectValidator} = require('../validators/CourseValidators');
const redisClient        = require('redis').createClient();
const {promisify}        = require('util');
const uuidV4             = require('uuid').v4;
redisClient.get = promisify(redisClient.get);
redisClient.lrange = promisify(redisClient.lrange);
redisClient.exists = promisify(redisClient.exists);

const validCourses = ['CS1114', 'CS2124', 'CS3613'];

exports.getCourses = async (req, res) => {
    res.render('homepage', {title: 'Homepage'});
};

exports.getScreenViewer = async (req, res) => {
    res.render('viewScreen', {title: 'View Student Screen'});
};

exports.connect = async (req, res) => {
    try {
        const result = await connectValidator.validate(req.body);
        if (result.error) {
            console.error(result.error);
            return res.sendStatus(400);
        }
        const {firstName, lastName, courseNumber} = result.value;
        if (!validCourses.includes(courseNumber)) {
            return res.sendStatus(400);
        }
        req.session.connected = true;
        req.session.firstName = firstName;
        req.session.lastName = lastName;
        req.session.courseNumber = courseNumber;
        let route = '/student';
        req.session.uuid = uuidV4();
        if (firstName === 'chris' && lastName === 'saldivar' || firstName === 'joseph' && lastName === 'branch' ) {
            req.session.instructor = true;
            route = '/screens'
        } else {
            req.session.student = true;
            const sessionKey = `sess:${req.sessionID}`
            redisClient.rpush(`students-${courseNumber}`, `${firstName} ${lastName}|${req.session.uuid}|${sessionKey}`);
            redisClient.incr(`students-${courseNumber}_count`);
        }

        return res.send(JSON.stringify({route}));
    }
    catch (err) {
        console.error(err);
        res.sendStatus(400);
    }
};

exports.getConnectedStudents = async (req, res) => {
    // const students = ["Student 1", "Student 2", "Student 3", "Student 4"];
    const numStudents = await redisClient.get(`students-${req.session.courseNumber}_count`);
    let students = await redisClient.lrange(`students-${req.session.courseNumber}`, "0", numStudents);
    students = await filter (students, async student => {
        const sessionKey = student.split("|")[2];
        const exists = await redisClient.exists(sessionKey);
        if (exists) {
            return true;
        } else {
            redisClient.lrem(`students-${req.session.courseNumber}`, 0, student);
        }
    });
    students = students.map(student => {
        const fields = student.split('|');
        return `${fields[0]}:${fields[1]}`;
    });
    redisClient.set(`students-${req.session.courseNumber}_count`, students.length);
    res.send(JSON.stringify({students}));
}

async function filter(arr, callback) {
    const fail = Symbol(); 
    return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i=>i!==fail);
}