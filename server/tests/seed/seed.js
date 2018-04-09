/************************************** 
            GLOBALS IMPORTS
***************************************/

const { ObjectID } = require('mongodb');

const jwt = require('jsonwebtoken');

const faker = require('faker');




/************************************** 
           LOCALS IMPORTS
***************************************/

const { User } = require('./../../models/User');

const { Post } = require('./../../models/Post');



/************************************** 
           DUMMIES DATAS
***************************************/

let userOneId = new ObjectID();

let userTwoId = new ObjectID();

let users = [{

    _id: userOneId,

    email: 'manouman@live.fr',

    username: 'M@rti@lis98',

    password: 'azADkj89',

    tokens: [{
        token: jwt.sign({ _id: userOneId.toHexString(), access: 'auth' }, process.env.JWT_SECRET).toString(),

        access: 'auth',
    }],

}, {

    _id: userTwoId,

    email: 'dekadooulai@live.fr',

    username: 'dek@do',

    password: 'azADkj89',

    tokens: [{
        token: jwt.sign({ _id: userTwoId.toHexString(), access: 'auth' }, process.env.JWT_SECRET).toString(),

        access: 'auth',
    }],

}];


let posts = [{
    title: faker.lorem.words,

    body: faker.lorem.paragraphs(),

    tags: [faker.lorem.slug(5), faker.lorem.slug(5), faker.lorem.slug(5)],

    _creator: userOneId,
}, {
    title: faker.lorem.words,

    body: faker.lorem.paragraphs(),

    tags: [faker.lorem.slug(5), faker.lorem.slug(5), faker.lorem.slug(5)],

    _creator: userOneId,

}, {
    title: faker.lorem.words,

    body: faker.lorem.paragraphs(),

    tags: [faker.lorem.slug(5), faker.lorem.slug(5), faker.lorem.slug(5)],

    _creator: userTwoId,

}];


let wipeUsers = () => {

    return User.remove({});

}


let wipePost = () => {

    return Post.remove({});

};

let populateUsers = (done) => {

    wipeUsers()
        .then(() => {

            let userOne = new User(users[0]).save();

            let userTwo = new User(users[1]).save();

            return Promise.all([userOne, userTwo]);

        })
        .then(() => {

            done();

        })
        .catch(e => done(e));

}


let populatePosts = (done) => {


    wipePost()
        .then(() => {

            return Post.insertMany(posts);

        })
        .then(posts => done())
        .catch(e => done(e))

}




module.exports = { populateUsers, users, populatePosts, posts };