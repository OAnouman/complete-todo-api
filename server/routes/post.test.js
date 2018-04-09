/************************************** 
            GLOBALS IMPORTS
***************************************/

const expect = require('expect');

const request = require('supertest');


/************************************** 
            LOCALS IMPORTS
***************************************/

const app = require('./../server');

const { Post } = require('./../models/Post');

const { populateUsers, users, populatePosts, posts } = require('./../tests/seed/seed');




/***************************************
 * Before hooks
 * Seed database
 */

beforeEach(populateUsers);

beforeEach(populatePosts);


/***************************************
 * Tests suites
 */


describe('POST /posts', () => {

    it('Should create a new post', (done) => {

        let post = {
            title: 'My new post !',
            body: 'My new post body',
            _creator: users[0]._id,
            tags: ['new', 'blog', 'post'],
        };


        request(app)
            .post('/posts')
            .send(post)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect(res => {

                expect(res.body.post.title).toBe(post.title);

                expect(res.body.post.tags).toEqual(post.tags);

            })
            .end((err, res) => {

                if (err) return done(err);

                Post.findOne({
                        title: post.title,
                        body: post.body
                    })
                    .then(p => {

                        expect(p).toExist();

                        expect(p.title).toBe(post.title);

                        expect(p.body).toBe(post.body);

                        done();

                    });


            });

    });

    it('Should not create a new post and return 400 if title and tags are not valid', (done) => {

        let post = {
            title: '     ',
            body: 'My new post body',
            _creator: users[0]._id,
            tags: ['ne', 'bl', 'po'],
        };


        request(app)
            .post('/posts')
            .send(post)
            .set('x-auth', users[0].tokens[0].token)
            .expect(400)
            .end((err, res) => {

                if (err) return done(err);

                Post.find()
                    .then(ps => {

                        expect(ps.length).toBe(3);

                        done();

                    })
                    .catch(e => done(e));


            });

    });

    it('Should return 400 if no data sent', (done) => {

        request(app)
            .post('/posts')
            .send()
            .set('x-auth', users[0].tokens[0].token)
            .expect(400)
            .end(done);

    });

    it('Should return 401 if token is not in header', (done) => {

        let post = {
            title: 'My new post !',
            body: 'My new post body',
            _creator: users[0]._id,
            tags: ['new', 'blog', 'post'],
        };

        request(app)
            .post('/posts')
            .send(post)
            .expect(401)
            .end(done);

    });

    it('Should create a new post with tags as comma separated string', (done) => {

        let post = {
            title: 'My new post !',
            body: 'My new post body',
            _creator: users[0]._id,
            tags: 'new,blog,post',
        };


        request(app)
            .post('/posts')
            .send(post)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect(res => {

                expect(res.body.post.title).toBe(post.title);

                expect(res.body.post.tags).toInclude('blog');

            })
            .end((err, res) => {

                if (err) return done(err);

                Post.findOne({
                        title: post.title,
                        body: post.body
                    })
                    .then(p => {

                        expect(p).toExist();

                        expect(p.title).toBe(post.title);

                        expect(p.body).toInclude(post.body);

                        done();

                    });


            });

    });



});