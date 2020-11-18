const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Séma definiálása, ahol a különböző képtípusokhoz való jogokat egy-egy boolean jelzi
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    permToJpg: {
        type: Boolean,
        required: true
    },
    permToPng: {
        type: Boolean,
        required: true
    },
    permToGif: {
        type: Boolean,
        required: true
    }
    
})

// Mentés előtt a user jelszavának hashelése
UserSchema.pre('save', function(next) {

    const user = this;

    if(user.isModified('password')) {
        bcrypt.genSalt(10, function(error, salt) {
            if(error) return next('Hiba a bcrypt generálás közben!')
            bcrypt.hash(user.password, salt, function(error, hash) {
                if(error) return next('Hiba a jelszó hashelése során!')
                user.password = hash;
                return next();
            })
        })
    } else {
        console.log('A jelszó nem változott, nem kellett hashelni!');
        return next();
    }
}) 

// Két jelszó ellenőrzese
UserSchema.methods.comparePasswords = function(password, next) {
    bcrypt.compare(password, this.password, function(error, isMatch) {
        return next(error, isMatch);
    })
}

mongoose.model('user', UserSchema);