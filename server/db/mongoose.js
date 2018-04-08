/************************************** 
            GLOBALS IMPORTS
***************************************/

const mongoose = require('mongoose');


/**********************************
    Connection to database.
    We use a connection string stored in process.env

*/

const connectionString = process.env.MONGODB_URI;

mongoose.connect(connectionString)
    .then(() => {})
    .catch(err => console.log(err));