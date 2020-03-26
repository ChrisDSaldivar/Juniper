const path           = require('path');
const fs             = require('fs');
const express        = require('express');
const routes         = require('./routes/index');
const errorHandlers  = require('./handlers/errorHandlers');
const redis          = require('redis');
const session        = require('express-session');
const RedisStore     = require('connect-redis')(session);

const app = express();

app.set('views', path.join(__dirname, 'views')); // this is the folder where we keep our pug files
app.set('view engine', 'pug');

const redisClient = redis.createClient()

const sess = session({
    store: new RedisStore({ 
        client: redisClient, // our redis client
        host: 'localhost',   // redis is running locally on our VM (we don't want anyone accessing it)
        port: 6379,          // 6379 is the default redis port (you don't have to set this unless you change port)
        ttl: 6 * 60 * 60,   // Time-To-Live (in seconds) this will expire the session in 6 hours
    }),
    secret: process.env.SESSION_SECRET || "1234", // Use a random string for this in production
    resave: false,
    cookie: {
        httpOnly: true,
    },
    saveUninitialized: false, // set this to false so we can control when the cookie is set (i.e. when the user succesfully logs in)
    name: 'id', // our cookie's name; make it generic to prevent fingerprinting
});

app.use(sess);
// bind the sessionParser here so we can use it in the websocket server
app.set('sessionParser', sess);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.locals.h = {
        siteName: process.env.SITE_NAME || 'Juniper',
        icon (name) { return fs.readFileSync(`./public/images/icons/${name}.svg`); }
    };
    res.locals.currentPath = req.path;
    next();
});


app.use('/', routes);



module.exports = app;