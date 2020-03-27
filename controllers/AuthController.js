const argon2    = require('argon2');
const dao       = require('../models/dao');
const UserModel = new (require('../models/UserModel'))(dao); // Funky syntax but it makes life easier. parens around require force precedence
const crypto    = require('crypto');


exports.register = async (req, res) => {
    console.log(req.body);
    let registerFunc = registerStudent;
    if (req.query && req.query.instructorCode) {
        const isValidCode = await isValidInstructorCode(req.body.email, req.query.instructorCode);
        if (isValidCode) {
            registerFunc = registerInstructor;
        } else {
            return res.sendStatus(400);
        }
    }

    try {
        console.log(`Registering: ${registerFunc.name}`);
        await registerFunc(req, res);
    } catch (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
            return res.sendStatus(409);
        }
        throw err;
    }
};

exports.login = async (req, res) => {
    const {email, password} = req.body;
    const result = await UserModel.getUserInfo(email);
    if (result === undefined) {
        return res.sendStatus(400);
    }

    const {userUUID, passwordHash, firstName, lastName, isStudent, isProctor, isInstructor} = result;
    
    if (await verifyPassword(passwordHash, password)) {
        req.session.firstName = firstName;
        req.session.lastName = lastName;
        req.session.isStudent = isStudent;
        req.session.isProctor = isProctor;
        req.session.isInstructor = isInstructor;
        req.session.uuid = userUUID;
        req.session.authenticated = true;
        req.session.instructor = isInstructor;
        req.session.student = isStudent;
        req.session.proctor = isProctor;
        req.session.role = isInstructor || isProctor ? 'proctor' : 'student';
        // connections.
        const route = isInstructor ? '/instructor' : '/student';
        res.redirect(route);
    } else {
        res.sendStatus(401);
    }
}

async function registerStudent (req, res) {
    const {email, password, firstName, lastName} = req.body;
    const passwordHash = await hashPassword(password);
    await UserModel.addStudent(email, passwordHash, firstName, lastName);
    res.redirect('/login');
}

async function registerInstructor (req, res) {
    const {email, password, firstName, lastName} = req.body;
    const passwordHash = await hashPassword(password);
    await UserModel.addInstructor(email, passwordHash, firstName, lastName);
    res.redirect('/login');
}

async function isValidInstructorCode (email, code) {
    const result = await UserModel.instructorCodeExists(code);
    return result !== undefined && genInstructorCode(email) === code;
}

// REMOVE THIS!!! JUST USING IT FOR TESTING
async function createInstructorCode (email) {
    const code = genInstructorCode(email);
    await UserModel.addInstructorCode(code);
    return code;
}
exports.createInstructorCode = createInstructorCode;

function genInstructorCode (email) {
    const hmac = crypto.createHmac('sha256', process.env.REGISTRATION_CODE_SECRET);
    hmac.update(email);
    return hmac.digest('hex');
}

async function hashPassword (password) {
    const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        hashLength: 32,
        timeCost: 3,
        parallelism: 1,
    })
    return hash;
}

async function verifyPassword (passwordHash, password) {
    return await argon2.verify(passwordHash, password);
}