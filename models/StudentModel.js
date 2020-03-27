const dao = require('./dao');

class StudentModel {
    constructor () {
        this.dao = dao;
    }

    async addCourse (studentUUID, courseUUID) {
        const sql = `
        INSERT INTO 
        Roster (studentUUID, courseUUID)
        VALUES (?, ?)
        `;
        
        await this.dao.run(sql, [studentUUID, courseUUID]);
    }

    async getCourses (studentUUID) {
        const sql = `
        SELECT courseUUID FROM Roster WHERE studentUUID=?
        `;

        return await this.dao.all(sql, [studentUUID]);
    }
}

module.exports = StudentModel;