// const Student                = require('../models/studentModel.js');
// const {screenShareValidator} = require('../validators/StudentValidators');

exports.screenShare = async (req, res) => {
    res.render('screenShare', {title: "ScreenShare"});
};

exports.updateScreenshot = async (req, res) => {
    console.log(req)
    res.render('allScreens', {title: "Active Students",
        students: ['as', 'asdfa','asdfa', 'asdfa','asdfa', 'asdfa','asdfa', 'asdfa','asdfa']}
    );
};

exports.initiateScreenShare = async (req, res) => {

};

exports.initiateAudioShare = async (req, res) => {

};
