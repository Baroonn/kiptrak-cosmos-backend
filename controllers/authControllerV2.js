const pg = require("pg");
const bcrypt = require("bcrypt");
const db = require("../db");
const queries = require("../queries/authQueriesV2");
const emailValidator = require("email-validator");
const dotenv = require("dotenv").config();
const Sib = require("sib-api-v3-sdk");
const jwt = require("jsonwebtoken");

const client = Sib.ApiClient.instance
const apiKey = client.authentications['api-key']
apiKey.apiKey = process.env.API_KEY

var container = db.userContainer;
const tranEmailApi = new Sib.TransactionalEmailsApi()
const sender = {
    email: 'bolaji4freelance@gmail.com',
    name: 'Bolaji',
}
const validateEmail = (email) => {
    const valid = emailValidator.validate(email);
    return valid;
}

const checkForExistingUser = async (caller, data, datatype) => {
    var { resources } = await container.items.query(caller(data)).fetchAll();
    if (resources.length > 0) {
        return `${datatype} already exists in the database`;
    }
    return "";
}

const getUser = async (username) => {
    var { resources } = await container.items.query(queries.getUserByUsername(username)).fetchNext();
    return resources[0];
}
const createUser = async (req, res, next) => {
    try {
        var { username, password, email, phonenumber } = req.body

        if (!username) {
            res.status(400);
            throw new Error("username not provided");
        }
        if (!password) {
            res.status(400);
            throw new Error("password not provided");
        }
        if (!email) {
            res.status(400);
            throw new Error("email not provided");
        }

        username = username.toLowerCase();
        var validInputPattern = "^[a-zA-Z0-9]+$";

        if (!username.match(validInputPattern)) {
            res.status(400);
            throw new Error("Invalid username pattern! Username can only contain letters and numbers")
        }

        if (password.length < 8) {
            res.status(400);
            throw new Error("Password is too short! Should be greater at least 8 characters");
        }

        if (!validateEmail(email)) {
            res.status(400);
            throw new Error("Email not in correct format");
        }
        var duplicateMessage = await checkForExistingUser(queries.getUserByUsername, username, "username");
        duplicateMessage += `\n${await checkForExistingUser(queries.getUserByEmail, email, "email")}`;

        if(phonenumber != ""){
            duplicateMessage += `\n${await checkForExistingUser(queries.getUserByPhone, phonenumber, "phone")}`;
        }
        
        if (duplicateMessage.trim() !== "") {
            res.status(400);
            throw new Error(duplicateMessage.trim());
        }
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);
        var vcode = Math.floor(100000 + Math.random() * 900000);
        var created = new Date();
        var vcodeexpirydate = created;

        const user = {
            "username": username,
            "password": hashedPassword,
            "email": email,
            "phone": phonenumber,
            "isEmailConfirmed": false,
            "vCode": vcode,
            "vCodeExpiryDate": vcodeexpirydate,
            "following": "",
            "created": created,
            "modified": created
        }
        const { resource } = await container.items.create(user);
        if (resource) {
            res.status(201).json({
                message: "User created successfully! Check your mailbox for the verification code."
            });
            const receivers = [
                { email },
            ]
            tranEmailApi
                .sendTransacEmail({
                    sender,
                    to: receivers,
                    subject: 'KipTrak Verification Code',
                    textContent: `KipTrak Verification Code.`,
                    htmlContent: `<h1>Please provide this code to your application: </h1><p>{{params.vcode}}</p>`,
                    params: {
                        vcode,
                    },
                })
                .then(console.log)
                .catch(console.log)
        }
        else {
            res.status(500);
            next(error);
        }
    }
    catch (error) {
        return next(error);
    }
}

const loginUser = async (req, res, next) => {
    try {
        var { username, password } = req.body;
        if (!username || !password) {
            res.status(400);
            throw new Error("Please provide your username and password!");
        }
        username = username.toLowerCase();

        var validInputPattern = "^[a-zA-Z0-9]+$";

        if (!username.match(validInputPattern)) {
            res.status(400);
            throw new Error("Invalid username pattern! Username can only contain letters and numbers")
        }

        var result = await getUser(username);
        console.log(result);
        if (result == undefined) {
            res.status(404);
            throw new Error("User does not exist");
        }

        var isCorrectPassword = await bcrypt.compare(password, result.password);
        var token;
        if (isCorrectPassword) {
            token = generateAccessToken({ username });
            //res.json({token})
        }
        else {
            res.status(401);
            throw new Error("Password is incorrect!")
        }

        var isEmailConfirmed = result.isEmailConfirmed;
        if (isEmailConfirmed) {
            res.json({ token })
        }
        else {
            var vcode = await generateVCode(result);
            const receivers = [
                { email: result.email },
            ]
            tranEmailApi
                .sendTransacEmail({
                    sender,
                    to: receivers,
                    subject: 'KipTrak Verification Code',
                    textContent: `KipTrak Verification Code.`,
                    htmlContent: `<h1>Please provide this code to your application: </h1><p>{{params.vcode}}</p>`,
                    params: {
                        vcode,
                    },
                })
                .then(console.log)
                .catch(console.log)
            return res.status(403).json({
                title: "Email Not Verified",
                message: "Please verify your email address! Check your inbox for verification code."
            });
        }
    }
    catch (error) {
        next(error);
    }
}

async function validateVCode(req, res, next) {
    try {
        var { code, username } = req.query;

        if (!code || !username) {
            res.status(400);
            throw new Error("Please provide code and username parameters.")
        }

        username = username.toLowerCase();
        var validInputPattern = "^[a-zA-Z0-9]+$";

        if (!username.match(validInputPattern)) {
            res.status(400);
            throw new Error("Invalid username pattern! Username can only contain letters and numbers")
        }

        if (!code.match(validInputPattern)) {
            res.status(400);
            throw new Error("Invalid username pattern! Username can only contain letters and numbers")
        }

        var result = await getUser(username);
        if (result == undefined) {
            res.status(404);
            throw new Error("User not found!")
        }

        if (result.isEmailConfirmed) {
            return res.status(200).json({ message: "User is already verified!" });
        }
        var vcode = result.vCode;
        if (vcode != code) {
            res.status(401);
            throw new Error("Code not valid");
        }
        result.isEmailConfirmed = true;
        await container.item(result.id, result.id).replace(result);
        res.status(200).json({ message: "User has been verified successfully" })

    } catch (error) {
        next(error);
    }
}

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "120m" })
}

async function generateVCode(user) {
    var vcode = Math.floor(100000 + Math.random() * 900000);
    var vcodeexpirydate = new Date();
    vcodeexpirydate.setHours(vcodeexpirydate.getHours() + 1);
    user.vCode = vcode;
    user.vCodeExpiryDate = vcodeexpirydate;
    user.modified = new Date();
    await container.item(user.id, user.id).replace(user);
    return vcode;
}

module.exports = { createUser, loginUser, validateVCode };