/************************************** 
            GLOBALS IMPORTS
***************************************/

const expect = require('expect');

const request = require('supertest');


/************************************** 
            LOCALS IMPORTS
***************************************/

const app = require('./../server');

const { User } = require('./../models/User');

const { populateUsers, users } = require('./../tests/seed/seed');




/***************************************
 * Before hooks
 * Seed database
 */

beforeEach(populateUsers);



describe('POST /users', () => {

    it('Should create a user and add x-auth header', (done) => {


        let user = {
            email: 'dekado@live.fr',
            username: 'Martialis98',
            password: '2aZ9kdA8',
        };


        request(app)
            .post('/users')
            .send(user)
            .expect(200)
            .expect(res => {

                expect(res.headers['x-auth']).toExist();

            })
            .end((err, res) => {

                User.findOne({ email: user.email })
                    .then(u => {

                        if (!u) {

                            return done(err);

                        }

                        expect(u.email).toBe(user.email);
                        expect(u.username).toBe(user.username);

                        expect(u.tokens.length).toBe(1);

                        done();

                    })
                    .catch(err => done(err));

            })

    });

    it('Should not create a user with an email which already exists', (done) => {

        request(app)
            .post('/users')
            .send(users[0])
            .expect(400)
            .expect(res => {

                expect(res.headers['x-auth']).toNotExist();

            })
            .end((err, res) => {

                User.find()
                    .then(us => {

                        if (!us) {

                            return done(err);

                        }

                        expect(us.length).toBe(2);

                        done();

                    })
                    .catch(err => done(err));

            })

    });

    it('Should not create a user with a username which already exists', (done) => {

        request(app)
            .post('/users')
            .send({

                email: 'marcellin@live.fr',
                username: 'dek@do',
                password: 'adDe89Qf'
            })
            .expect(400)
            .expect(res => {

                expect(res.headers['x-auth']).toNotExist();

            })
            .end((err, res) => {

                User.find()
                    .then(us => {

                        if (!us) {

                            return done(err);

                        }

                        expect(us.length).toBe(2);

                        done();

                    })
                    .catch(err => done(err));

            })

    });

    it('Should not create a user with a non-valid password ', (done) => {

        request(app)
            .post('/users')
            .send({
                email: 'marcellin@live.fr',
                username: 'm@rcellin',
                password: '12365'
            })
            .expect(400)
            .expect(res => {

                expect(res.headers['x-auth']).toNotExist();

            })
            .end((err, res) => {

                User.find()
                    .then(us => {

                        if (!us) {

                            return done(err);

                        }

                        expect(us.length).toBe(2);

                        done();

                    })
                    .catch(err => done(err));

            })

    });

});

describe('GET /users/me', () => {

    it('Should return 401 if auth token is missing from header', (done) => {

        request(app)
            .get('/users/me')
            .expect(401)
            .end(done);

    })

    it('Should return user matching auth token', (done) => {

        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect(res => {

                expect(res.body.user).toExist();

                expect(res.body.user._id).toBe(users[0]._id.toHexString());

            })
            .end(done);

    })


})