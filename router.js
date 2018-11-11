const AfricasTalking = require('africastalking');
const express = require('express');
const router = express.Router();

const africasTalking = new AfricasTalking({
    username: 'sandbox',
    apiKey: '19dc6df2e876b11472df5bd9733bc836586afaba103cb182dda84cabfc60f437',
});

const sms = africasTalking.SMS;

const CONFIG_USERNAME = 'user1';
const CONFIG_PASSWORD = 'pass1';
const CONFIG_VERIFICATION_CODE = '';
const CONFIG_PHONE_NUMBER = '+254724402159';

router.get('/', (req, res, next) => {
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

router.get('/login', (req, res, next) => {
    if (req.session.loggedIn === true) {
        res.redirect('/');
    } else {
        res.render('login', {
            title: 'Login | Africa\'s Talking 2FA',
        });
    }
});

router.post('/login', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username === CONFIG_USERNAME && password === CONFIG_PASSWORD) {
        req.session.sendVerificationCode = true;
        req.session.verificationFailed = false;
        res.redirect('/verify');
    } else {
        res.redirect('/login');
    }
});

const sendVerificationCode = () => {
    let randomNumber = Math.floor(1000 + Math.random() * 9000);
    CONFIG_VERIFICATION_CODE = 'VC-' + randomNumber;

    let message = 'Your login verification code is: ' + CONFIG_VERIFICATION_CODE;

    console.log('Sending message...');
    sms.send({
        to: CONFIG_PHONE_NUMBER,
        message: message,
    })
    .then(response => {
        console.log('Message Sent!');
        console.log(response);
    })
    .catch(error => {
        console.log('Message Failed!');
        console.log(error);
    });
}

router.get('/verify', (req, res, next) => {
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

router.post('/verify', (req, res, next) => {
    let code = req.body.code;

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

router.post('/logout', (req, res, next) => {
    delete req.session.loggedIn;
    res.redirect('/');
});

module.exports = router;

