/************************************** 
            GLOBALS IMPORTS
***************************************/

const express = require('express');

const _ = require('lodash');

const { ObjectID } = require('mongodb');


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


Router.post('/', authenticate, async(req, res) => {


    // If no data passed in req 

    if (!req.body) {

        res.sendStatus(400);

    }


    let post = new Post(_.pick(req.body, ['title', 'body', 'tags']));

    post._creator = req.user._id;

    post.author = req.user.username;

    /*
     * Check if tags are passed as array 
     * or comma separated string. If string
     * convert it to array
     */

    if (!Array.isArray(req.body.tags) && typeof req.body.tags === 'string') {

        post.tags = _.split(post.tags, ',');

    } else if (!Array.isArray(post.tags) && typeof post.tags !== 'string') {

        /*
         * If post tags neither array or string
         * assign null
         */
        post.tags = null;

    }

    try {

        await post.save();

        res.send({ post });

    } catch (e) {

        res.status(400).send({ e })

    }

});

Router.patch('/:id', authenticate, async(req, res) => {

    let post = _.pick(req.body, ['title', 'body', 'tags']);

    if (!req.params.id || !ObjectID.isValid(req.params.id) || Object.keys(post).length <= 0) {

        return res.sendStatus(400);

    }

    try {

        let updatedPost = await Post.findOneAndUpdate({

            _id: req.params.id,

            _creator: req.user._id

        }, {
            $set: {
                title: post.title,
                body: post.body
            },
            $addToSet: {
                tags: post.tags,
            }
        }, { new: true, runValidators: true });

        if (!updatedPost) throw new Error()

        res.send({ post: updatedPost });

    } catch (e) {

        res.sendStatus(404);
    }

});

Router.get('/', authenticate, async(req, res) => {

    try {

        let posts = await Post.find();

        res.send({ posts })

    } catch (e) {

        res.sendStatus(400);

    }

});

Router.get('/:id', authenticate, async(req, res) => {

    if (!req.params.id || !ObjectID.isValid(req.params.id)) {

        return res.sendStatus(400);

    }

    try {

        let post = await Post.findOne({

            _id: req.params.id

        });

        if (!post) throw new Error();

        res.send({ post });

    } catch (e) {

        res.sendStatus(404);

    }

});

Router.delete('/:id', authenticate, async(req, res) => {

    if (!req.params.id || !ObjectID.isValid(req.params.id)) {

        return res.sendStatus(400);

    }

    try {

        let post = await Post.findOneAndRemove({
            _id: req.params.id,

            _creator: req.user._id,
        });

        if (!post) throw new Error();

        res.send({ post });

    } catch (e) {

        res.sendStatus(404);

    }


});


module.exports = Router;