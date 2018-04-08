const { User } = require('./../models/User');


/**
 * Verify that the client is allowed to 
 * make the request
 * 
 * @param {any} req 
 * @param {any} res 
 * @param {any} next 
 */
let authenticate = (req, res, next) => {

    /*
     * Trying to retrieve auth token 
     * from request header 
     */

    let token = req.header('x-auth');

    if (token) {

        /*
         * Trying to find user matching the
         * given auth token
         */

        User.findByToken(token)
            .then(user => {

                if (!user) {
                    return Promise.reject();
                }

                // Put user and token into req

                req.user = user;

                req.token = token;

                // Pass to the next req handler

                next();


            })
            .catch(e => {

                res.sendStatus(401);

            })

    } else {

        res.sendStatus(401);

    }

}


module.exports = { authenticate };