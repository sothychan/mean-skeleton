var bcrypt = require('bcrypt');
/**
 * The Login API.
 * @param  {Object<express>}
 * @param  {Object<mongoose>}
 * @param  {Object<router>}
 */
module.exports = function (app, mongoose, router) {

    router.post('/api/login', function (req, res) {

        // make passport authenticate call
        app.get('passport').authenticate('local', function(err, user) {
            // bail on an error
            if (err) { throw err; }
            // bail if the user isnt found
            if (!user) { return res.json({ success: false, err: 'Invalid login'}); }

            // set a cookie we will use on the frontend to fake a bearer token
            res.cookie('cookie-name', user.get('userSalt'), {maxAge: (365 * 24 * 60 * 60 * 1000), httpOnly: false, path: '/'});

            // since we have a user, call serialize through login
            req.login(user, {}, function(err) {
                // bail on any errors
                if (err) { throw err; }

                // return the user api call.
                res.json({ success: true });
            });
        })(req, res);

    });
};