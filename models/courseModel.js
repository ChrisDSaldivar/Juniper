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

    async authorizedProctor (userUUID, courseUUID, isInstructor) {
        let sql = `
            SELECT 1
            FROM ${isInstructor ? 'Courses' : 'Proctors'}
            WHERE ${isInstructor ? 'instructorUUID' : 'proctorUUID'}=? and courseUUID=?
        `;
        return await this.dao.get(sql, [userUUID, courseUUID]);
    }

    async isAuthorizedInstructor (instructorUUID, courseUUID) {
        let sql = `
            SELECT 1
            FROM Courses
            WHERE instructorUUID=? and courseUUID=?
        `;
        return await this.dao.get(sql, [instructorUUID, courseUUID]);
    }

    async addProctorCode (proctorCode, courseUUID) {
        let sql = `
            INSERT INTO Proctor_Codes (code, courseUUID)
            VALUES (?, ?)
        `;
        return await this.dao.get(sql, [proctorCode, courseUUID]);
    }

    async getProctorCode (courseUUID) {
        const sql = `
            SELECT code
            FROM Proctor_Codes
            WHERE courseUUID=?
        `
        return await this.dao.get(sql, [courseUUID]);
    }

    async addProctor (proctorUUID, courseUUID) {
        const sql = `
            INSERT INTO Proctors (proctorUUID, courseUUID)
            VALUES (?, ?)
        `;
        await this.dao.run(sql, [proctorUUID, courseUUID]);

        const {prefix, courseNum, sectionNum, courseName} = await this.getCourseInfo(courseUUID);
        return {courseName: `${prefix}${courseNum}-${sectionNum} ${courseName}`};
    }

    async getCourseWithProctorCode (proctorCode) {
        const sql = `
            SELECT courseUUID
            FROM Proctor_Codes
            WHERE code=?
        `;
        return await this.dao.get(sql, [proctorCode]);
    }

    async isProctorForCourse (proctorUUID, courseUUID) {
        const sql = `
            SELECT 1
            FROM Proctors
            WHERE proctorUUID=? and courseUUID=?
        `;

        return this.dao.get(sql, [proctorUUID, courseUUID]);
    }
}

module.exports = CourseModel;