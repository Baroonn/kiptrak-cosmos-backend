const db = require("../db");
const queries = require("../queries/assignmentQueriesV2");
const cloudinary = require("cloudinary")
const container = db.assignmentContainer;

const uploadImages = async (req, res, next) => {
    try {
        //check that user id matches the assignment
        console.log("here");
        var assignment_id = req.params.id;
        
        var {resources} = await container.items.query(queries.getAssignment(assignment_id)).fetchAll();
        if(resources.length == 0 || resources[0].userId != req.user.username){
            res.status(403);
            throw new Error("You are not allowed to make changes to this assignment");
        }
        var count = 0;
        var images = 0;
        const files = req.files;
        for(const file of files){
            const upload = await cloudinary.v2.uploader.upload(file.path, {public_id: `${assignment_id}_${count}`});
            images++;
            //console.log(upload);
            count++;
        }
        resources[0].images = images;
        var result = resources[0];
        
        await container.item(result.id, result.userId).replace(result);
        return res.json({
            success: true,
            message: "Images uploaded successfully"
            //file: upload.secure_url,
        });
    } catch (error) {
        next(error)
    }

};

module.exports = {
    uploadImages,
}