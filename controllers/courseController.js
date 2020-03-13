// const Course           = require('../models/courseModel');
const {connectValidator} = require('../validators/CourseValidators');
const redisClient        = require('redis').createClient();
const {promisify}        = require('util');
redisClient.get = promisify(redisClient.get);
redisClient.lrange = promisify(redisClient.lrange);

const validCourses = ['CS1114', 'CS2124', 'CS3613'];

exports.getCourses = async (req, res) => {
    res.render('homepage', {title: 'Homepage'});
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
        req.session.student = true;
        redisClient.rpush(`students-${courseNumber}`, `${firstName} ${lastName}`);
        redisClient.incr(`students-${courseNumber}_count`);

        return res.sendStatus(200);
    }
    catch (err) {
        console.error(err);
        res.sendStatus(400);
    }
};

exports.getConnectedStudents = async (req, res) => {
    const numStudents = await redisClient.get(`students-${req.session.courseNumber}_count`);
    const students = await redisClient.lrange(`students-${req.session.courseNumber}`, "0", numStudents);

    res.send(JSON.stringify({students}))
}