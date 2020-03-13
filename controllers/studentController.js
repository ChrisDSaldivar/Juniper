// const Student                = require('../models/studentModel.js');
// const {screenShareValidator} = require('../validators/StudentValidators');

exports.screenShare = async (req, res) => {
    let firstName = req.session.firstName;
    let lastName = req.session.lastName;
    res.render('screenShare', {title: "ScreenShare", firstName, lastName});
};

exports.updateScreenshot = async (req, res) => {
    console.log(req)
    res.render('allScreens', {title: "Active Students"});
};

exports.initiateScreenShare = async (req, res) => {

};

exports.initiateAudioShare = async (req, res) => {

};
