// load env variables
const dotenv = require("dotenv").config();

// import the secrets keys 
const secretKey = process.env.SECRETKEY;
const hmacKey = process.env.HMACKEY;
const salt = process.env.SALT;

// import bcrypt
const bcrypt = require('bcrypt');

// import user model
const User = require('../models/Users');

// import json web token
const jsonwebtoken = require ('jsonwebtoken');

// import crypto JS
const cryptoJS = require('crypto-js');

// middleware signup , user doesn't exist yet
exports.signup = (req, res, next) => {
    let encryptingEmail = cryptoJS.HmacSHA512(req.body.email, hmacKey);
    let hashEmail = encryptingEmail.toString(cryptoJS.enc.Base64);
    bcrypt.hash(req.body.password, salt)
    .then(function(hash) {
        const user = new User({
            email: hashEmail,
            password: hash
        });
        user.save()
        .then(() => res.status(201).json({message : 'Utilisateur créé'}))
        .catch(error => res.status(400).json({error}))
    })
    .catch(error => res.status(500).json({error}))
};

// middleware login, user already has an account
exports.login = (req, res, next) =>{
    let encryptingEmail = cryptoJS.HmacSHA512(req.body.email, hmacKey);
    let hashEmail = encryptingEmail.toString(cryptoJS.enc.Base64);
    // console.log(cryptoJS.AES.decrypt(hashEmail, hmacKey))
    User.findOne({ email: hashEmail })
    .then(user => {
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized: login/password incorrect'});
        }
        bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if (!valid) {
                    return res.status(401).json({ error : 'Unauthorized: login/password incorrect' });
                }
                res.status(200).json({
                    userId: user._id,
                    token: jsonwebtoken.sign(
                        { userId : user._id },
                         secretKey,
                        { expiresIn : '24h'}
                    )
                });
            })
            .catch(error => res.status(500).json({ error : error  }));
    })
    .catch(error => res.status(500).json({ error : error }));
};