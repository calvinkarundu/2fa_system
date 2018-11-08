var AfricasTalking = require('africastalking');
var express = require('express');
var router = express.Router();

var africasTalking = new AfricasTalking({
    username: 'sandbox',
    apiKey: '19dc6df2e876b11472df5bd9733bc836586afaba103cb182dda84cabfc60f437',
});

var sms = africasTalking.SMS;

var CONFIG_USERNAME = 'user1';
var CONFIG_PASSWORD = 'pass1';
var CONFIG_VERIFICATION_CODE = '';
var CONFIG_PHONE_NUMBER = '+254724402159';

router.get('/', function(req, res, next) {
    if (req.session.loggedIn === true) {
        res.render('index', {
            title: 'Home | Africa\'s Talking 2FA',
            welcomeTitle: 'Nice!',
            welcomeMessage: 'You made it :)',
        });
    } else {
        res.redirect('/login');
    }
});

router.get('/login', function(req, res, next) {
    if (req.session.loggedIn === true) {
        res.redirect('/');
    } else {
        res.render('login', {
            title: 'Login | Africa\'s Talking 2FA',
        });
    }
});

router.post('/login', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    if (username === CONFIG_USERNAME && password === CONFIG_PASSWORD) {
        req.session.sendVerificationCode = true;
        req.session.verificationFailed = false;
        res.redirect('/verify');
    } else {
        res.redirect('/login');
    }
});

function sendVerificationCode() {
    var randomNumber = Math.floor(1000 + Math.random() * 9000);
    CONFIG_VERIFICATION_CODE = 'VC-' + randomNumber;

    var message = 'Your login verification code is: ' + CONFIG_VERIFICATION_CODE;

    console.log('Sending message...');
    sms.send({
        to: CONFIG_PHONE_NUMBER,
        message: message,
    })
    .then(function(response) {
        console.log('Message Sent!');
        console.log(response);
    })
    .catch(function(error) {
        console.log('Message Failed!');
        console.log(error);
    });
}

router.get('/verify', function(req, res, next) {
    if (req.session.loggedIn === true) {
        res.redirect('/');
    } else {
        if (req.session.sendVerificationCode === true && req.session.verificationFailed === false) {
            sendVerificationCode();
        }

        res.render('verify', {
            title: 'Verify | Africa\'s Talking 2FA',
        });
    }
});

router.post('/verify', function(req, res, next) {
    var code = req.body.code;

    if (code === CONFIG_VERIFICATION_CODE) {
        req.session.loggedIn = true;
        delete req.session.sendVerificationCode;
        delete req.session.verificationFailed;

        CONFIG_VERIFICATION_CODE = '';

        res.redirect('/');
    } else {
        req.session.verificationFailed = true;
        res.redirect('/verify');
    }
});

router.post('/logout', function(req, res, next) {
    delete req.session.loggedIn;
    res.redirect('/');
});

module.exports = router;

