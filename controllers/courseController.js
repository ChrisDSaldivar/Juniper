const CourseModel = new (require('../models/courseModel'));
const connections = require('./connectionsController');
const redisClient = require('redis').createClient();
const {promisify} = require('util');
const cc  = require('coupon-code');

// I should make a controller that wraps redis and exposes an
// API for accessing the cache
redisClient.get    = promisify(redisClient.get);
redisClient.lrange = promisify(redisClient.lrange);
redisClient.exists = promisify(redisClient.exists);
redisClient.hget   = promisify(redisClient.hget);

exports.getCourses = async (req, res) => {
    res.render('homepage', {title: 'Homepage'});
};

exports.getScreenViewer = async (req, res) => {
    res.render('viewScreen', {title: 'View Student Screen'});
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
};

exports.createCourse = async (req, res) => {
    const {prefix, courseNum, sectionNum, courseName} = req.body;
    const courseCode = cc.generate({ parts : 4 });
    const instructorUUID = req.session.uuid;
    await CourseModel.addCourse(prefix, courseNum, sectionNum, courseCode, instructorUUID, courseName);
    res.json({courseCode});
};

exports.getCreateCourseForm = (req, res) => {
    res.render('createCourse');
};

exports.joinCourse = async (req, res) => {
    const courseUUID = req.params.courseUUID;
    if (await CourseModel.inClass(req.session.uuid, courseUUID)) {
        req.session.courseUUID = courseUUID;
        res.render('screenShare');
    } else {
        res.sendStatus(403);
    }
}