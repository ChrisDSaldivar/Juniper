// const Course           = require('../models/courseModel');
const {connectValidator} = require('../validators/CourseValidators');
const connections        = require('./connectionsController');
const redisClient        = require('redis').createClient();
const {promisify}        = require('util');
const uuidV4             = require('uuid').v4;

// I should make a controller that wraps redis and exposes an
// API for accessing the cache
redisClient.get    = promisify(redisClient.get);
redisClient.lrange = promisify(redisClient.lrange);
redisClient.exists = promisify(redisClient.exists);
redisClient.hget   = promisify(redisClient.hget);

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
        req.session.role = 'student';
        let route = '/student';
        req.session.uuid = uuidV4();
        if (firstName === 'chris' && lastName === 'saldivar' || firstName === 'joseph' && lastName === 'branch' ) {
            req.session.instructor = true;
            route = '/screens'
            req.session.role = 'proctor';
        } else {
            req.session.student = true;
            redisClient.hset(req.session.uuid, 'firstName', firstName);
            redisClient.hset(req.session.uuid, 'lastName', lastName);
        }

        return res.send(JSON.stringify({route}));
    }
    catch (err) {
        console.error(err);
        res.sendStatus(400);
    }
};

exports.getConnectedStudents = async (req, res) => {
    console.log(connections);
    const studentIDs = connections.getStudentIDs(req.session.courseNumber);
    const students = await Promise.all(
        studentIDs.map( async (id) => {
            const firstName = await redisClient.hget(id, 'firstName');
            const lastName  = await redisClient.hget(id, 'lastName');
            return `${firstName} ${lastName}:${id}`;
        })
    );
    res.send(JSON.stringify({students}));
}