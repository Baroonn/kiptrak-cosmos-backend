const express = require("express");
const router = express.Router({mergeParams: true});
const {uploadImages} = require("../controllers/imageUploadController");

router.route("/").post(uploadImages);

module.exports = router;