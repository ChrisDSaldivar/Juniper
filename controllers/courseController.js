// const Course           = require('../models/courseModel');
const {connectValidator} = require('../validators/CourseValidators');

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

        return res.sendStatus(200);
    }
    catch (err) {
        console.error(err);
        res.sendStatus(400);
    }
};