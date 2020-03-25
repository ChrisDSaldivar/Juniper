const sqlite3 = require('sqlite3');
const fs      = require('fs');
const path    = require('path');

const dbPath = path.join(__dirname, '..', 'Database', 'Juniper.db');
const db = new sqlite3.Database(dbPath);

const schemaPath = path.join(__dirname, '..', 'models', 'schema.sql');

const schema = fs.readFileSync(schemaPath).toString('ascii');
db.exec(schema);