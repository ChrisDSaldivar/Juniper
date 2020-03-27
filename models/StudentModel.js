class StudentModel {
    constructor (dao) {
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

   
}

module.exports = StudentModel;