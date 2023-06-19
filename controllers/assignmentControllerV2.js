const pg = require("pg");

pg.types.setTypeParser(1082, function (value) {
    return value;
})

//const { parseInputDatesAsUTC } = require("pg/lib/defaults");
const db = require("../db");
const queries = require("../queries/assignmentQueriesV2");
const userQueries = require("../queries/userQueriesV2");
const cloudinary = require("../cloudinary");
const container = db.assignmentContainer;
const userContainer = db.userContainer;

const getAssignments = async (req, res, next) => {
    try {
        var { resources } = await userContainer.items.query(userQueries.getUser(req.user.username)).fetchAll();

        if (resources.rowCount == 0) {
            res.status(404);
            throw new Error("User not found");
        }

        var following = resources[0].following;

        following = following.replaceAll("|", ", ");
        following += req.user.username;
        var { resources } = await container.items.query(queries.getAssignments(following)).fetchAll();
        for (var i = 0; i < resources.length; i++) {
            var x = resources[i];
            var imageCount = resources[i].images;
            var imagesUrl = "";
            var j;
            for (j = 0; j < imageCount - 1; j++) {
                imagesUrl += await cloudinary.url(`${x.id}_${j}`);
                imagesUrl += "|";
            }
            imagesUrl += imageCount != 0? (await cloudinary.url(`${x.id}_${j}`)) : "";

            x.images = imagesUrl;
        }
        res.json(resources);
    } catch (error) {
        next(error);
    }
};

const createAssignment = async (req, res, next) => {
    try {
        const { title, description, course, lecturer, dateDue, notes } = req.body;
        if (!title || !description || !course || !lecturer || !dateDue) {
            res.status(400);
            throw new Error("All fields (title, description, course, lecturer, dateDue) except 'notes' and 'images' are mandatory");
        }

        var date = Date.parse(dateDue)
        if (!date || Date.now() >= date) {
            res.status(400);
            throw new Error("Invalid date");
        }


        const assignment = {
            "title": title,
            "description": description,
            "course": course,
            "lecturer": lecturer,
            "dateDue": new Date(dateDue),
            "notes": notes,
            "images": 0,
            "created": new Date(),
            "userId": req.user.username
        };

        const { resource } = await container.items.create(assignment);
        if (resource) {
            res.status(201).json(assignment)
        }
        else {
            res.status(500);
            next(error);
        }

    } catch (error) {
        next(error);
    }
};

module.exports = { getAssignments, createAssignment };