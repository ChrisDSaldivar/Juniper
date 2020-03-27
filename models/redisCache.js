const redisClient = require('redis').createClient();
const {promisify} = require('util');


redisClient.get    = promisify(redisClient.get);
redisClient.lrange = promisify(redisClient.lrange);
redisClient.exists = promisify(redisClient.exists);
redisClient.hget   = promisify(redisClient.hget);
redisClient.hset   = promisify(redisClient.hset);

module.exports = redisClient;