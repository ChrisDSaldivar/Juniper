const StudentModel = new (require('../models/StudentModel.js'));
const CourseModel  = new (require('../models/courseModel'));
// const {screenShareValidator} = require('../validators/StudentValidators');

exports.screenShare = async (req, res) => {
    res.render('studentPage', {title: "Courses"});
};

exports.addCourse = async (req, res) => {
    const {courseCode} = req.body;
    await StudentModel.addCourse(req.session.uuid, courseCode);
};

exports.getCourses = async (req, res) => {
    const courses = await StudentModel.getCourses(req.session.uuid);
    res.json({courses});
};