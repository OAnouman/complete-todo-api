/************************************** 
            GLOBALS IMPORTS
***************************************/

const mongoose = require('mongoose');

const { ObjectID } = require('mongodb');

const validator = require('validator');

const _ = require('lodash');



/************************************** 
            LOCALS IMPORTS
***************************************/





/**************************************
 * Defining post schema
 */

let PostSchema = new mongoose.Schema({

    title: {

        type: String,

        required: true,

        minlength: 1,

        trim: true,

    },

    body: {

        type: String,

        required: true,

        minlength: 1,

        trim: true,

    },

    createdAt: {

        type: Number,

        default: Date.now,

    },

    lastModified: {

        type: Number,

        default: null,

    },

    tags: [{

        type: String,

        minlength: 3,

        trim: true,

    }],

    _creator: {

        type: mongoose.Schema.Types.ObjectId,

        required: true,

    }

});


/**************************************
 * Statics methods
 */



/**
 * Find all post created by a user
 * 
 * @param {mongoose.Schema.Types.ObjectId} id : user id
 * @returns {Promise}
 */
PostSchema.statics.findByCreator = function(id) {

    let Post = this;

    if (ObjectID.isValid(id)) {

        return Post.findOne({

            _creator: id

        });
    } else {

        return Promise.reject(new Error('The given id is not valid'));

    }

};

/**
 * 
 * 
 * @param {String} tag 
 * @returns {Promise}
 */
PostSchema.statics.findByTag = function(tag) {

    let Post = this;

    if (tag.trim().length > 0) {

        return Post.find({
                tags: tag

            })
            .sort('createdAt', 1);

    } else {

        return Promise.reject(new Error('The specified tag is not a vaid string'));

    }



};



/**************************************
 * Creating post model
 */


let Post = mongoose.model('Post', PostSchema);



module.exports = { Post };