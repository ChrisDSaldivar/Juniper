const Joi = require('@hapi/joi');

exports.connectValidator = Joi.object({
    firstName: Joi.string()
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),
    lastName: Joi.string()
        .pattern(/^[a-zA-Z]+$/)
        .required(),
    courseNumber: Joi.string()
        .pattern(/^CS[0-9]{4}$/)
        .required(),
});