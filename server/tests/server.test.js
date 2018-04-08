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

const { populateUsers, users } = require('./seed/seed');




/***************************************
 * Before hooks
 * Seed database
 */




describe('/', () => {

    it('Should return Blog API', (done) => {

        request(app)
            .get('/')
            .expect(200)
            .expect(res => {

                expect(res.body.res).toBe('Blog API');

            })
            .end(done);

    });

});