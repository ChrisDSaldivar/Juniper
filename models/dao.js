const sqlite3 = require('sqlite3');
const util    = require('util');
const { join } = require('path');

const dirPath = join(__basedir, 'Database', process.env.dbFilePath || 'Juniper.db');

function createDB (dbFilePath) {
    return new sqlite3.Database(dbFilePath, (err) => {
        if (err) {
            console.error(`Could not open ${dbFilePath}`);
            throw err;
        }
    });
}


function createDAO (dbFilePath) {
    const db  = createDB(dbFilePath);
    db.run    = util.promisify(db.run);
    db.get    = util.promisify(db.get);
    db.all    = util.promisify(db.all);
    return db;
}

module.exports = createDAO(dirPath);