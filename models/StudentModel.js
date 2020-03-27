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
        const data = this.dao.get(sql, [courseCode]);
        const {courseUUID} = data;

        sql = `
        INSERT INTO 
        Roster (studentUUID, courseUUID)
        VALUES (?, ?)
        `;
        
        await this.dao.run(sql, [studentUUID, courseUUID]);
    }

    async getCourses (studentUUID) {
        const sql = `
        SELECT courseUUID, prefix, courseNum, sectionNum FROM Roster WHERE studentUUID=?
        `;

        return await this.dao.all(sql, [studentUUID]);
    }
}

module.exports = StudentModel;