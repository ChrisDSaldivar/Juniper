const CourseModel = new (require('../models/courseModel'));
const UserModel = new (require('../models/UserModel'));
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
};

exports.courseViewer = async (req, res) => {
    const courseUUID = req.params.courseUUID;
    if (await CourseModel.authorizedProctor(req.session.uuid, courseUUID, req.session.isInstructor)) {
        req.session.courseUUID = courseUUID;
        res.render('allScreens', {title: "Active Students"});
    } else {
        res.sendStatus(403);
    }
};

exports.genProctorCode = async (req, res) => {
    const instructorUUID = req.session.uuid;
    const {courseUUID} = req.body;
    console.log(req.body)
    console.log("gen")
    if (await CourseModel.isAuthorizedInstructor(instructorUUID, courseUUID)) {
        console.log("authorized")
        let proctorCode = cc.generate({ parts: 4 });
        console.log(`Generated code for ${courseUUID} is: ${proctorCode}`);
        try {
            await CourseModel.addProctorCode(proctorCode, courseUUID);
            console.log("Added code")
            res.json({proctorCode});
        } catch (err) {
            if (err.message.includes("UNIQUE constraint failed") ) {
                console.log("failed to add")
                let {code: proctorCode} = await CourseModel.getProctorCode(courseUUID);
                return res.status(409).json({proctorCode})
            }
            throw err;
        }
    } else {
        res.sendStatus(403);
    }
};

exports.addProctor = async (req, res) => {
    const {proctorCode} = req.body;
    const proctorUUID = req.session.uuid;
    console.log(proctorUUID);
    console.log(proctorCode);
    if (!(await UserModel.userUUIDExists(proctorUUID))) {
        return res.status(403);
    }
    const {courseUUID} = await CourseModel.getCourseWithProctorCode(proctorCode);
    const {prefix, courseNum, sectionNum, courseName} = await CourseModel.getCourseInfo(courseUUID);
    const course = `${prefix}${courseNum}-${sectionNum} ${courseName}`;
    
    if (await CourseModel.isProctorForCourse(proctorUUID, courseUUID)) {
        res.status(409);
    } else {
        await CourseModel.addProctor(proctorUUID, courseUUID);
        req.session.isProctor = true;
        req.session.proctor = true;
    }

    res.json({courseName: course});
}