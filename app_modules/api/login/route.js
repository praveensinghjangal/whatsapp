const express = require('express');
const router = express.Router();
const user_func = require("./api");

router.post("/login", user_func.login);
router.get("/get_country", user_func.get_country);
router.get("/check_username", user_func.check_username);
router.get("/get_industry", user_func.get_industry);
router.get("/get_otp_purpose", user_func.get_otp_purpose);
router.get("/check_email", user_func.check_email);

module.exports = router;
