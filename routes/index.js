const express          = require('express');
const router           = express.Router();
const courseController = require('../controllers/courseController');
const studentController = require('../controllers/studentController');
const authController = require('../controllers/AuthController');
const { catchErrors }    = require('../handlers/errorHandlers');

router.use('/student', validateStudentConnection);
router.use('/instructor', validateInstructorConnection);
router.use('/assistant', validateAssistantConnection);

router.get('/', 
    checkRedirect,
    catchErrors(courseController.getCourses)
);


router.get('/screens', 
    validateProctorConnection,
    catchErrors(studentController.updateScreenshot)
);

router.get('/view', 
    validateProctorConnection,
    catchErrors(courseController.getScreenViewer)
);

router.get('/courses/connectedStudents', 
    validateProctorConnection,
    catchErrors(courseController.getConnectedStudents)
);

router.get('/record',
    (req, res) => {res.render('screenRecorder.pug')}
)

// Students
router.get('/student',
    catchErrors(studentController.studentPage)
);

router.get('/student/courses',
    catchErrors(studentController.getCourses)
);

router.put('/student/courses',
    catchErrors(studentController.addCourse)
);

router.get('/student/course',
    catchErrors(courseController.joinCourse)
);

// Courses
router.get('/instructor/courses',
    validateInstructorConnection,
    courseController.getCreateCourseForm
);

router.put('/instructor/courses',
    validateInstructorConnection,
    catchErrors(courseController.createCourse)
);

// User accounts
router.post('/register',
    catchErrors(authController.register),
);

router.post('/login', 
    catchErrors(authController.login)
);

// REMOVE THIS!!! JUST USING IT FOR TESTING
router.put('/instructorCode', catchErrors(async (req, res) => {
    const code = await authController.createInstructorCode(req.body.email);
    res.send(code);
}));

// Default Error Handler
router.use( (err, req, res, next) => {
    console.error(err.stack);
    console.error(err);
    res.sendStatus(500);
});

function checkRedirect (req, res, next) {
    if (req.session.student) {
        return res.redirect('/student');
    } else if (req.session.instructor) {
        return res.redirect('/screens');
    } else if (req.session.assistant) {
        return res.redirect('/screens');
    }
    next();
}

function validateStudentConnection (req, res, next) {
    console.log('validating student')
    if (!req.session.authenticated || !req.session.student) {
        return res.redirect('/');
    } else {
        next();
    }
}

function validateProctorConnection (req, res, next) {
    if (!(req.session.authenticated && (req.session.assistant || req.session.instructor))) {
        return res.redirect('/');
    } else {
        next();
    }
}

function validateAssistantConnection (req, res, next) {
    if (!req.session.authenticated || !req.session.assistant) {
        return res.redirect('/');
    } else {
        next();
    }
}

function validateInstructorConnection (req, res, next) {
    if (!req.session.authenticated || !req.session.instructor) {
        return res.redirect('/');
    } else {
        next();
    }
}

module.exports = router;