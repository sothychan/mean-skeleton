var fs = require('fs');

/**
 * imports all files within the route/ folder.
 * @param  {Object<Express>}
 * @param  {Object<Mongo>}
 */
module.exports = function (app, mongoose, router) {

    fs.readdirSync(__dirname + '/models').forEach(function (file) {
        var name = file.substr(0, file.indexOf('.'));
        console.log('setting up Model: ', name);
        require('./models/' + name)(app, mongoose, router);
    });


    fs.readdirSync(__dirname + '/routes').forEach(function (file) {
        var name = file.substr(0, file.indexOf('.'));
        console.log('setting up route: ', name);
        require('./routes/' + name)(app, mongoose, router);
    });
    
};