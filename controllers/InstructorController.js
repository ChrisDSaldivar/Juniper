const InstructorModel = require('../models/InstructorModel');
const CourseModel  = new (require('../models/courseModel'));

exports.instructorPage = (req, res) => {
    res.render('instructorPage');
};

exports.getCourses = async (req, res) => {
    let courseUUIDs = await InstructorModel.getCourses(req.session.uuid);
    courseUUIDs = courseUUIDs.map(row => row.courseUUID);
    let courses = [];
    for (const courseUUID of courseUUIDs) {
        courses.push(await CourseModel.getCourseInfo(courseUUID));
    }
    res.json({courses});
};