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

    it('Should create a user with auth token and add x-auth header', (done) => {


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

                expect(res.body.user.authToken).toNotBe(null);

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

                        expect(us.length).toBe(3);

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

                        expect(us.length).toBe(3);

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

                        expect(us.length).toBe(3);

                        done();

                    })
                    .catch(err => done(err));

            })

    });

});


describe('POST /users/login', () => {

    it('Should return user matching valid credentials and add x-auth token to header', (done) => {

        let creds = { email: users[0].email, password: users[0].password };

        request(app)
            .post('/users/login')
            .send(creds)
            .expect(200)
            .expect(res => {

                expect(res.headers['x-auth']).toExist();

                expect(res.body.user.email).toBe(creds.email);

                expect(res.body.user._id).toBe(users[0]._id.toHexString());

            })
            .end(done);

    })
})

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

describe('DELETE /users/logout', () => {

    it('Should remove auth token and logout user', (done) => {

        request(app)
            .delete('/users/logout')
            .set('x-auth', users[1].tokens[0].token)
            .expect(200)
            .end((err, res) => {

                if (err) return done(err);

                User.findOne({ _id: users[1]._id })
                    .then(user => {

                        if (!user) return done(err);

                        expect(user.tokens.length).toBe(0);

                        done();

                    })
                    .catch(e => done(e));

            });

    });


});