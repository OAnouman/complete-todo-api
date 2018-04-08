/************************************** 
            GLOBALS IMPORTS
***************************************/

const express = require('express');

const _ = require('lodash');


/************************************** 
            LOCALS IMPORTS
***************************************/

const { authenticate } = require('./../middleware/authenticate');

const { User } = require('./../models/User');


/************************************** 
            MIDDLEWARES
***************************************/

// Router.use(authenticate);


/************************************** 
            LOCALS VARS
***************************************/

const Router = express.Router();


/************************************** 
            USER'S ROUTES
***************************************/

Router.post('/', (req, res) => {

    /*
     * Extract only require data from
     * request to be sure to ignore extra 
     * values passed by client 
     */

    let body = _.pick(req.body, ['email', 'username', 'password']);

    let user = new User(body);

    user.save()
        .then(() => {

            return user.generateAuthToken();

        })
        .then(token => {

            req.header('x-auth', token)
                .send({ user });

        })
        .catch(e => {

            res.status(400).send({ e });

        })

});


Router.get('/me', authenticate, (req, res) => {

    // Retrieve token from request 

    let token = req.header('x-auth');

    User.findByToken(token)
        .then(user => {

            if (!user) return Promise.reject();

            res.send({ user });

        })
        .catch(e => res.status(400).send({ e }));

});

module.exports = Router;