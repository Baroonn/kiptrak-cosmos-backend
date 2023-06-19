const db = require("../db");
const queries = require("../queries/userQueriesV2");
var {userContainer} = db;
var container = userContainer;

const getUsers = async (req, res, next) => {
    try {
        const searchTerm = req.query.search;
        if (!searchTerm) {
            res.status(400);
            throw new Error("Please provide the 'search' query string.")
        }

        var {resources} = await container.items.query(queries.getUsers(searchTerm.toLowerCase())).fetchAll();
        res.json(resources);
    } catch (error) {
        next(error);
    }

}

const getFollowing = async (req, res, next) => {
    try {
        var { resources } = await container.items.query(queries.getUser(req.user.username)).fetchAll();
        var following = resources[0].following;
        res.json({
            message: following
        });
    } catch (error) {
        next(error);
    }
}

const followUser = async (req, res, next) => {
    try {
        var tobeFollowed = req.params.username.toLowerCase();
        if (req.user.username == tobeFollowed) {
            res.status(403);
            throw new Error("You cannot follow yourself");
        }
        var { resources } = await container.items.query(queries.getUser(tobeFollowed)).fetchAll();
        if(resources.length==0){
            res.status(404);
            throw new Error("User does not exist to follow");
        }
        var { resources } = await container.items.query(queries.getUser(req.user.username)).fetchAll();
        if (resources[0].following.includes(tobeFollowed)) {
            return res.json({ message: "You already follow this user." })
        }
        var newFollowing = resources[0].following + `${tobeFollowed}|`;
        var result = resources[0];
        result.following = newFollowing;
        result.modified = new Date();
        await container.item(result.id, result.id).replace(result);
        return res.json({ message: "User followed successfully." });
    } catch (error) {
        next(error);
    }
}

const unfollowUser = async (req, res, next) => {
    try {
        var tobeUnFollowed = req.params.username.toLowerCase();
        
        if (req.user.username == tobeUnFollowed) {
            res.status(403);
            throw new Error("You cannot unfollow yourself");
        }

        var { resources } = await container.items.query(queries.getUser(tobeUnFollowed)).fetchAll();
        if(resources.length==0){
            res.status(404);
            throw new Error("User does not exist to unfollow");
        }
        var { resources } = await container.items.query(queries.getUser(req.user.username)).fetchAll();
        if (!resources[0].following.includes(tobeUnFollowed)) {
            return res.json({ message: "You do not follow this user" })
        }
        var newFollowing = resources[0].following.replace(`${tobeUnFollowed}|`, '');
        var result = resources[0];
        result.following = newFollowing;
        result.modified = new Date();
        await container.item(result.id, result.id).replace(result);
        return res.json({ message: "User unfollowed successfully." });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getUsers,
    followUser,
    unfollowUser,
    getFollowing
}