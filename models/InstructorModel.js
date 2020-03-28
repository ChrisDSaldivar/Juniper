const dao = require('./dao');

exports.getCourses = async (instructorUUID) => {
    const sql = `
    SELECT Courses.courseUUID
    FROM Courses JOIN Instructors ON Courses.instructorUUID=Instructors.instructorUUID
    WHERE Instructors.instructorUUID=?
    `;

    return await dao.all(sql, [instructorUUID]);
}