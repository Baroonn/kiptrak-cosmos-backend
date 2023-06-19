const express = require("express");
const router = express.Router({mergeParams: true});
const {getUsers,followUser,unfollowUser, getFollowing} = require("../controllers/userControllerV2");

router.route("/").get(getUsers);
router.route("/:username/follow").get(followUser);
router.route("/:username/unfollow").get(unfollowUser);
router.route("/following").get(getFollowing);

module.exports = router;