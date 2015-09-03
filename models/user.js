var timestamps = require('mongoose-timestamp');

module.exports = function (app, mongoose) {
    var userSchema = new mongoose.Schema({
        displayName: String,
        email: String,
        hashedPassword: String,
        userSalt: String,
        status: { type: String, default: 'active' },
    });

    userSchema.plugin(timestamps);

    return mongoose.model('user', userSchema);
};