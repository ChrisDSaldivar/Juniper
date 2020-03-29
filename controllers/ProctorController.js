const CourseModel = new (require('../models/courseModel'));
const ProctorModel = new (require('../models/ProctorModel'));

exports.getCourses = async (req, res) => {
    let courseUUIDs = await ProctorModel.getCourses(req.session.uuid);
    courseUUIDs = courseUUIDs.map(row => row.courseUUID);
    let courses = [];
    for (const courseUUID of courseUUIDs) {
        courses.push(await CourseModel.getCourseInfo(courseUUID));
    }
    res.json({courses});
};