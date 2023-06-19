const express = require("express");
const router = express.Router();
const {createUser, loginUser, validateVCode} = require("../controllers/authControllerV2");

router.route("/register").post(createUser);
router.route("/login").post(loginUser);
router.route("/validatecode").get(validateVCode);

module.exports = router;