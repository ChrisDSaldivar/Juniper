const dao = require('./dao');

class ProctorModel {
    constructor () {
        this.dao = dao;
    }

    async getCourses (proctorUUID) {
        const sql = `
        SELECT courseUUID
        FROM Proctors
        WHERE proctorUUID=?
        `;

        return await this.dao.all(sql, [proctorUUID]);
    }
}

module.exports = ProctorModel;