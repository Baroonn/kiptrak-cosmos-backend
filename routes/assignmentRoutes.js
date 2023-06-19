const express = require("express");
const router = express.Router();
const {getAssignments, createAssignment} = require("../controllers/assignmentControllerV2");

router.route("/").get(getAssignments).post(createAssignment);

module.exports = router;