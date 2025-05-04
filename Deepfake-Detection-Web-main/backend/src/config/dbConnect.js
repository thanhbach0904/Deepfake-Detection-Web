/**
 * Filename: dbConnect.js
 * Description: This file contains the code to connect to MongoDB using mongoose.
 *              It uses the environment variable MONGODB_URI defined in the .env file to connect to the database.
 */
const mongoose = require('mongoose');

const dbConnect = async () => {
    try {
        const connect = await mongoose.connect(process.env.CONNECTION_STRING)
        console.log(`MongoDB connected: ${connect.connection.host}, ${connect.connection.name}`);
        console.log(`MongoDB is running on port ${connect.connection.port}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = dbConnect;