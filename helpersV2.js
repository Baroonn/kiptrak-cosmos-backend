const jwt = require("jsonwebtoken");
const { getUserByUsername } = require("./queries/authQueriesV2");
const { userContainer } = require("./db");

function validateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    console.log(req.params);

    if (token == null) {
        res.status(400).json({ message: "Token not present" })
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) {
            res.status(403).json({ message: "Token invalid" })
        }
        else {
            var { resources } = await userContainer.items.query(getUserByUsername(user.username)).fetchAll();
            if (resources.length == 0) {
                res.status(404);
                next(Error("User not found"));
            }
            else {
                req.user = user
                next()
            }
        }
    })
}

module.exports = {
    validateToken
}