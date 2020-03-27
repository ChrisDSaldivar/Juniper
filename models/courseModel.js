const uuidV4 = require('uuid').v4;
const dao = require('./dao');

class CourseModel {
    constructor () {
        this.dao = dao;
    }

    async addCourse (prefix, courseNum, sectionNum, courseCode, instructorUUID) {
        const sql = `
            INSERT INTO Courses
            (courseUUID, prefix, courseNum, sectionNum, courseCode, instructorUUID)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await this.dao.run(sql, [uuidV4(), prefix, courseNum, sectionNum, courseCode, instructorUUID]);
    }

    async getCourseUUID (prefix, courseNum, sectionNum) {
        const sql = `
            SELECT courseUUID
            FROM Courses
            WHERE prefix=? and courseNum=? and sectionNum=?
        `;

        return await this.dao.get(sql, [prefix, courseNum, sectionNum]);
    }
}

module.exports = CourseModel;