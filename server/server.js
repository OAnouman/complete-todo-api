/************************************** 
            GLOBALS IMPORTS
***************************************/

require('./config/config.js');

const express = require('express');

const bodyParser = require('body-parser');

const app = express();



/************************************** 
            LOCALS IMPORTS
***************************************/



/************************************** 
            DATABASE
***************************************/

require('./db/mongoose');



/************************************** 
                MIDDLEWARES
***************************************/

app.use(bodyParser.json());

// User route module

app.use('/users', require('./routes/user'));

// Post route module

app.use('/posts', require('./routes/post'));





/************************************** 
                VARIABLES
***************************************/






/************************************** 
                ROUTES
***************************************/

app.all('/', (req, res) => {

    res.send({ res: 'Blog API' });

});




/************************************** 
                SERVER
***************************************/


app.listen(process.env.PORT, () => console.log('Server running on port', process.env.PORT));


// For test purpose

module.exports = app;