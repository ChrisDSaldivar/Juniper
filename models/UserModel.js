const uuidV4 = require('uuid').v4;
const dao = require('./dao');

class UserModel {
    constructor () {
        this.dao = dao;
    }

    async getUserInfo (email) {
        return await this.dao.get(
            'select userUUID, passwordHash, firstName, lastName, isStudent, isProctor, isInstructor from Users where email=?', 
            [email]
        );
    }

    async addStudent (email, passwordHash, firstName, lastName) {
        const sql = `
        INSERT INTO 
        Users (email, passwordHash, firstName, lastName, userUUID) 
        VALUES (?, ?, ?, ?, ?)
        `;
        
        await this.dao.run(sql, [email, passwordHash, firstName, lastName, uuidV4()]);
    }

    async addInstructor (email, passwordHash, firstName, lastName) {
        const uuid = uuidV4();
        let sql = `
        INSERT INTO 
        Users (email, passwordHash, firstName, lastName, isStudent, isInstructor, userUUID) 
        VALUES (?, ?, ?, ?, false, true, ?)
        `;
        
        await this.dao.run(sql, [email, passwordHash, firstName, lastName, uuid]);
    }

    async addInstructorCode (code) {
        const sql = `INSERT INTO  Instructor_Codes (code) VALUES (?)`;
        await this.dao.run(sql, [code]);
    }

    async instructorCodeExists (code) {
        const sql = `SELECT 1 FROM Instructor_Codes WHERE code=?`;
        return await this.dao.get(sql, [code]);
    }

    async userUUIDExists (uuid) {
        const sql = `SELECT 1 FROM Users WHERE userUUID=?`;
        return await this.dao.get(sql, [uuid]);
    }
}

module.exports = UserModel;