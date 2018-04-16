/************************************** 
            GLOBALS IMPORTS
***************************************/

const mongoose = require('mongoose');

const validator = require('validator');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const _ = require('lodash');



/************************************** 
            LOCALS IMPORTS
***************************************/






/**************************************
 * Defining user schema
 */

let UserSchema = new mongoose.Schema({

    email: {

        type: String,

        required: [true, 'Email is required'],

        minlength: [1, 'Email must be at least 1 character'],

        trim: true,

        unique: [true, 'This email address already exists'],

        validate: {

            validator: validator.isEmail,

            message: '{VALUE} is not a valid email'

        }

    },

    username: {

        type: String,

        trim: true,

        unique: [true, 'Username already exists'],

        required: [true, 'Username is required'],

        minlength: [3, 'Username must be at least 3 characters']

    },

    password: {

        type: String,

        required: [true, 'Password is required'],

        minlength: [true, 'Password must be at least 8 characters'],

        validate: {

            validator: function(v) {

                return new RegExp('[A-Za-z0-9]{8,}').test(v);

            },

            message: '{VALUE} must contains at least one uppercase, one lowercase and number'
        }

    },

    tokens: [{

        access: {

            type: String,

            required: true,

        },

        token: {

            type: String,

            required: true,

        }

    }],

});


/************************************
 * Adding instance methods on user schema
 */


/**
 * Generate auth tokens
 * 
 * @returns {Promise.resolve}
 */
UserSchema.methods.generateAuthToken = function() {

    // Retrieve user 

    let user = this;

    let access = 'auth';

    /* 
     * Generate token with jsonwebtoken and
     * push access and token into user's tokens
     * array 
     */

    let token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET).toString();

    user.tokens.push({ token, access });

    // Save user and return a Promise.resolve 
    return user.save()
        .then(() => token);


};



/**
 * Remove user auth token from 
 * 
 * @returns {Promise}
 */
UserSchema.methods.removeToken = function(token) {

    // Retrieve user

    let user = this;

    // Remove token and update user

    return user.update({

        $pull: {
            tokens: { token }
        }

    });

};


UserSchema.methods.toJSON = function() {

    // Get object version of user instance

    let user = this.toObject();

    // Return only specified property

    return _.pick(user, ['_id', 'email', 'username', 'authToken']);

}



/************************************
 * Adding class methods on user schema
 */


/**
 * Retrive user matching a given token string
 * 
 * @param {any} token : User authentication token
 * @returns {Promise}
 */
UserSchema.statics.findByToken = function(token) {

    // Retrieve user Model

    let User = this;

    let decodedToken;

    try {

        decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    } catch (e) {

        return Promise.reject(e);

    }

    // Retrieve user matching given token

    return User.findOne({
        _id: decodedToken._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });

}


UserSchema.statics.findByCredentials = function(credentials) {

    let User = this;

    return User.findOne({

            email: credentials.email,

        })
        .then(user => {

            if (!user) return Promise.reject();

            return bcrypt.compare(credentials.password, user.password)
                .then(isEqual => {

                    if (isEqual) {
                        return Promise.resolve(user);
                    } else {
                        return Promise.reject();
                    }

                });

        });

}



/************************************
 * HOOKS
 */



/**
 * Hash password just before
 * create user
 * 
 * @param {any} next
 * 
 */
let preSaveHook = async function(next, done) {

    let user = this;

    if (user.isModified('password')) {

        try {

            let salt = await bcrypt.genSalt(10);

            let hash = await bcrypt.hash(user.password, salt);

            user.password = hash;

            next();

        } catch (e) {

            done(e);

        }

    } else {

        next();

    }

}

/**********************************
 * Adding pre save hook to hash user password
 * before saving if modified
 */

UserSchema.pre('save', preSaveHook);



/**********************************
 * Defining user model
 */

const User = mongoose.model('User', UserSchema);




module.exports = { User };