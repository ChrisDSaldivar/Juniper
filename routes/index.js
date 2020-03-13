const express          = require('express');
const router           = express.Router();
const courseController = require('../controllers/courseController');
const studentController = require('../controllers/studentController');
const { catchErrors }    = require('../handlers/errorHandlers');

router.use('/student', validateStudentConnection);
router.use('/instructor', validateInstructorConnection);
router.use('/student', validateStudentConnection);
router.use('/ta', validateTAConnection);

router.get('/', 
    checkRedirect,
    catchErrors(courseController.getCourses)
);
router.post('/connect', catchErrors(courseController.connect));

router.get('/student',
    catchErrors(studentController.screenShare)
);

function checkRedirect (req, res, next) {
    if (req.session.student) {
        return res.redirect('/student');
    } else if (req.session.instructor) {
        return res.redirect('/instructor');
    } else if (req.session.ta) {
        return res.redirect('/ta');
    }
    next();
}

function validateStudentConnection (req, res, next) {
    if (!req.session.connected && !req.session.student) {
        return res.redirect('/');
    } else {
        next();
    }
}

function validateTAConnection (req, res, next) {
    if (!req.session.connected && !req.session.tag) {
        return res.redirect('/');
    } else {
        next();
    }
}

function validateInstructorConnection (req, res, next) {
    if (!req.session.connected && !req.session.instructor) {
        return res.redirect('/');
    } else {
        next();
    }
}

module.exports = router;