/************************************** 
            GLOBALS IMPORTS
***************************************/

const express = require('express');

const _ = require('lodash');


/************************************** 
            LOCALS IMPORTS
***************************************/

const { authenticate } = require('./../middleware/authenticate');

const { Post } = require('./../models/Post');


/************************************** 
            MIDDLEWARES
***************************************/

// Router.use(authenticate);


/************************************** 
            LOCALS VARS
***************************************/

const Router = express.Router();


/************************************** 
            POST'S ROUTES
***************************************/


Router.post('/', authenticate, (req, res) => {


    // If no data passed in req 

    if (!req.body) {

        res.sendStatus(400);

    }


    let post = new Post(_.pick(req.body, ['title', 'body', 'tags']));

    post._creator = req.user._id;

    /*
     * Check if tags are passed as array 
     * or comma separated string. If string
     * convert it to array
     */

    if (!Array.isArray(req.body.tags) && typeof req.body.tags === 'string') {

        post.tags = _.split(post.tags, ',');

        console.log(post.tags);

    } else if (!Array.isArray(post.tags) && typeof post.tags !== 'string') {

        /*
         * If post tags neither array or string
         * assign null
         */
        post.tags = null;

    }

    post.save()
        .then(() => {

            res.send({ post });


        })
        .catch(err => res.status(400).send({ err }));


});




module.exports = Router;