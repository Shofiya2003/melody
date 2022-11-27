const express = require('express');
const router = express.Router();
const logger = require('../utils/logger/logger');

//user db
const User = require("../models/user");

//get google object
const google = require('../utils/google/google');

google.seed();

//function to take user to consent screen
router.get('/signin/google', (req, res) => {
    const consentScreenUrl = google.generateUrl();
    res.redirect(consentScreenUrl);
})

//callback url
router.get('/google/melody', google.exchangeCode, async (req, res) => {
    try {
        logger.info('inside the call back url');
        const user = JSON.parse(req.user);

        //find the user in the database
        const data = await User.findOne({ email: user["email"] });

        if (!data) {
            logger.info("new user");
            const newUser = new User({ name: user.name, email: user["email"], googleId: user.id, picture: user.picture });
            await newUser.save();
        } else {
            logger.info("user already registered");
        }
        res.json({ msg: "success", user: { email: user.email, name: user.name } });
    } catch (err) {
        logger.error(`something went wrong with logic ${err.msg}`);
        res.json({ msg: "something went wrong" });
    }
})

module.exports = router;