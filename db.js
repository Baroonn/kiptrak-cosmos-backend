const dotenv = require("dotenv").config();

const Pool = require("pg").Pool

// const pool = new Pool({
//     user: process.env.PGUSER,
//     host: process.env.PGHOST,
//     database: process.env.PGDATABASE,
//     password: process.env.PGPASSWORD,
//     port: process.env.PGPORT
// })

// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
//     // ssl: {
//     //     rejectUnauthorized: false,
//     // }
// })

//CosmosDB connection
const { CosmosClient } = require("@azure/cosmos");
const key = process.env.COSMOS_KEY
const endpoint = process.env.COSMOS_ENDPOINT
const cosmosClient = new CosmosClient({ endpoint, key });
const initDatabase = () => {
    // Create database if it doesn't exist
    const database = cosmosClient.database("kiptrak");
    console.log(`${database.id} database ready`);
    return database;
}

const db = initDatabase();
const getUserContainer = () => {
    // Create container if it doesn't exist
    const container = db.container("users")
    console.log(`${container.id} container ready`);
    return container;
}

const getAssignmentContainer = () => {
    const container = db.container("assignments")
    return container;
}
var userContainer = getUserContainer();
var assignmentContainer = getAssignmentContainer();
module.exports = {
    userContainer,
    assignmentContainer
};