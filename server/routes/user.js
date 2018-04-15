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

Router.post('/', async(req, res) => {

    // If no data passed in req 

    if (!req.body) {

        res.sendStatus(400);

    }


    /*
     * Extract only require data from
     * request to be sure to ignore extra 
     * values passed by client 
     */

    let body = _.pick(req.body, ['email', 'username', 'password']);

    let user = new User(body);

    try {

        await user.save();

        let token = await user.generateAuthToken();

        res.header('x-auth', token).send({ user });

    } catch (e) {

        res.status(400)
            .send({
                    error: {
                        code: e.code,
                        message: e.errmsg,
                    }
                }

            )
    }


});

Router.post('/login', async(req, res) => {

    // Extract only needed infos

    const credentials = _.pick(req.body, ['email', 'password']);

    try {

        let user = await User.findByCredentials(credentials);

        if (!user) throw new Error();

        let token = await user.generateAuthToken();

        res.header('x-auth', token).send({ user });

    } catch (e) {

        res.sendStatus(404);

    }

});

Router.get('/me', authenticate, async(req, res) => {

    // Retrieve token from request 

    const token = req.header('x-auth');

    try {

        const user = await User.findByToken(token);

        if (!user) throw new Error();

        res.send({ user });

    } catch (e) {

        res.status(400).send({ e })

    }

});

Router.delete('/logout', authenticate, async(req, res) => {

    const user = req.user;

    try {

        await user.removeToken(req.token)

        res.sendStatus(200);

    } catch (e) {

        res.sendStatus(400)

    }

});

module.exports = Router;