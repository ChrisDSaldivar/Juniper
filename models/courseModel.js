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
}

module.exports = CourseModel;