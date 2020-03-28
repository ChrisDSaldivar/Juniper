const dao = require('./dao');

class StudentModel {
    constructor () {
        this.dao = dao;
    }

    async addCourse (studentUUID, courseCode) {
        let sql = `
        SELECT courseUUID
        FROM Courses 
        WHERE courseCode=?
        `
        const data = await this.dao.get(sql, [courseCode]);
        const {courseUUID} = data;

        sql = `
        INSERT INTO 
        Roster (studentUUID, courseUUID)
        VALUES (?, ?)
        `;
        
        await this.dao.run(sql, [studentUUID, courseUUID]);
        return courseUUID;
    }

    async getCourses (studentUUID) {
        const sql = `
        SELECT Courses.courseUUID
        FROM Courses JOIN Roster ON Courses.courseUUID=Roster.courseUUID
        WHERE Roster.studentUUID=?
        `;

        return await this.dao.all(sql, [studentUUID]);
    }
}

module.exports = StudentModel;