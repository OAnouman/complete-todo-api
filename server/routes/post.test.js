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

describe('POST /posts/id', () => {

    it('Should update post and update lastModified property', (done) => {

        const post = { title: 'Updated title', body: 'A new body', tags: ['updated'] };

        request(app)
            .patch(`/posts/${posts[0]._id}`)
            .set('x-auth', users[0].tokens[0].token)
            .send(post)
            .expect(200)
            .expect(res => {

                expect(res.body.post._id).toBe(posts[0]._id.toHexString());

                expect(res.body.post.lastModified).toNotBe(null);

            })
            .end(done);

    });

    it('Should not update post if post contains invalid data', (done) => {

        const post = { title: 'Updated title', body: '', tags: ['up'] };

        request(app)
            .patch(`/posts/${posts[0]._id}`)
            .set('x-auth', users[0].tokens[0].token)
            .send(post)
            .expect(404)
            .end(done);

    });

    it('Should return 400 if id is not valid', (done) => {

        const post = { title: 'Updated title', body: '', tags: ['up'] };

        request(app)
            .patch(`/posts/123`)
            .set('x-auth', users[0].tokens[0].token)
            .send(post)
            .expect(400)
            .end(done);

    });

    it('Should return 404 if user is not allowed to update post', (done) => {

        const post = { title: 'Updated title', body: '', tags: ['up'] };

        request(app)
            .patch(`/posts/${posts[0]._id}`)
            .set('x-auth', users[1].tokens[0].token)
            .send(post)
            .expect(404)
            .end(done);

    });

});

describe('GET /posts', () => {

    it('Should return an array of two posts', (done) => {

        request(app)
            .get('/posts')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect(res => {

                expect(res.body.posts.length).toBe(2);

                expect(res.body.posts[0].title).toBe(posts[0].title);

            })
            .end(done);

    });

    it('Should return a empty array if user as no post', (done) => {

        request(app)
            .get('/posts')
            .set('x-auth', users[2].tokens[0].token)
            .expect(200)
            .expect(res => {

                expect(res.body.posts.length).toBe(0);

            })
            .end(done);

    });

    it('Should return 404 if user not authenticated', (done) => {

        request(app)
            .get('/posts')
            .expect(401)
            .end(done);

    });

});

describe('GET /posts/:id', () => {

    it('Should return a post matching the given id', (done) => {

        request(app)
            .get(`/posts/${posts[0]._id}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect(res => {

                expect(res.body.post._id).toBe(posts[0]._id.toHexString());

                expect(res.body.post.title).toBe(posts[0].title);

            })
            .end(done);

    });

    it('Should return a 404 if user is not the owner of the requested post', (done) => {

        request(app)
            .get(`/posts/${posts[0]._id}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end(done);

    });

    it('Should return a 400 if id is not valid', (done) => {

        request(app)
            .get(`/posts/123`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(400)
            .end(done);

    });

});