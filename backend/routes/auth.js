require('dotenv').config();

const express = require('express');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const userModel = require('../model/userschema');

const { isAuthenticated, isAdmin } = require('../middleware/auth');

const router = express.Router();


router.post('/login', async (req, res) => {
    const body = req.body;

    const username = body?.username;
    const password = body?.password;

    // TODO: Add Validation

    try {
        const user = await userModel.findOne({username: username}).exec();
        console.log(username);
        if (!user) return res.status(403).send({error: "Invalid Username", code: 403});

        const password_hash = user?.password;
        if (!await argon2.verify(password_hash, password)) return res.status(403).send({error: "Invalid Password", code: 403});

        const uData = { _id: user?._id, username: user?.username, name: user?.name, acType: user?.acType, isAdmin: user?.isAdmin, phoneNumber: user?.phoneNumber }
        const token = jwt.sign(uData, process.env.JWT_SECRET);
        return res.status(200).send({token, user});
    } catch (err) {
        console.error(err);
        return res.status(500).send({error: err, code:500});
    }
});

router.post('/register', async (req, res) => {
    const body = req.body;

    const username = body?.username;
    const password = body?.password;
    const confirmPassword = body?.cpassword;
    const name = body?.name;
    const phoneNumber = body?.phoneNumber;

    // TODO: Add Validation

    try {
        if (password !== confirmPassword) {
            return res.status(500).send({error: "Passwords mismatch", code: 500});
        }
        const hash = await argon2.hash(password);
        const newUser = await userModel({username, password: hash, name, phoneNumber});
        await newUser.save();

        return res.status(201).send({newUser});
    } catch (err) {
        console.error(err);
        return res.status(500).send({error: err, code: 500});
    }
});

router.get('/', isAuthenticated, (req, res) => {
    const user = req?.user;
    return res.status(200).send({user});
});

router.post('/registerAdmin', isAuthenticated, isAdmin, async (req, res) => {
    const body = req?.body;
    const username = body?.username;
    const password = body?.password;
    const confirmPassword = body?.cpassword;
    const name = body?.name;
    const phoneNumber = body?.phoneNumber;
    const acType = 'ADMIN';
    const isAdmin = true;

    // TODO: Add Validation

    try {
        if (password !== confirmPassword) {
            return res.status(500).send({error: "Passwords mismatch", code: 500});
        }
        const hash = await argon2.hash(password);
        const newUser = await userModel({username, password: hash, isAdmin, acType, name, phoneNumber});
        await newUser.save();

        return res.status(201).send({newUser});
    } catch (err) {
        console.error(err);
        return res.status(500).send({error: err, code: 500});
    }
})

module.exports = router;