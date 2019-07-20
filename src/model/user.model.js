var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    firstname: {
        type: String, 
        required: true
    },
    lastname: {
        type: String,
        required: false
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    isNewUser: {
        type: Boolean,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true
    }
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

userSchema.pre("save", function (next) {
    var that = this;
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(that.password, salt, (err, hash) => {
            that.password = hash;
            next();
        });
    });
});

userSchema.pre("update", function (next) {
    var that = this;
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(that.password, salt, (err, hash) => {
            that.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(candidatePassword) {
    let password = this.password;
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, password, (err, success) => {
            if (err) return reject(err);
            return resolve(success);
        });
    });
};

module.exports = mongoose.model('User', userSchema);