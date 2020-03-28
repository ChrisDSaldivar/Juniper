const uuidV4 = require('uuid').v4;
const dao = require('./dao');

class CourseModel {
    constructor () {
        this.dao = dao;
    }

    async getCourseInfo (courseUUID) {
        let sql = `
            SELECT prefix, courseNum, sectionNum, courseCode, instructorUUID, courseName
            FROM Courses
            Where courseUUID=?
        `;
        let {instructorUUID, ...data} = await this.dao.get(sql, [courseUUID]);

        sql = `
            SELECT firstName, lastName
            FROM Users
            Where userUUID=?
        `;
        let {firstName, lastName} = await this.dao.get(sql, [instructorUUID]);
        return {...data, firstName, lastName, courseUUID};
    }

    async addCourse (prefix, courseNum, sectionNum, courseCode, instructorUUID, courseName) {
        const sql = `
            INSERT INTO Courses
            (courseUUID, prefix, courseNum, sectionNum, courseCode, instructorUUID, courseName)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await this.dao.run(sql, [uuidV4(), prefix, courseNum, sectionNum, courseCode, instructorUUID, courseName]);
    }

    async getCourseUUID (prefix, courseNum, sectionNum) {
        const sql = `
            SELECT courseUUID
            FROM Courses
            WHERE prefix=? and courseNum=? and sectionNum=?
        `;

        return await this.dao.get(sql, [prefix, courseNum, sectionNum]);
    }

    async inClass (studentUUID, courseUUID) {
        const sql = `SELECT 1 FROM Roster WHERE studentUUID=? and courseUUID=?`;
        return await this.dao.get(sql, [studentUUID, courseUUID]);
    }
}

module.exports = CourseModel;