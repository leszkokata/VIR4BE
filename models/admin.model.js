const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Séma definiálása
const AdminSchema = new mongoose.Schema({
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
    isAdmin: {
        type: Boolean,
        required: true
    }
})

// Mentés előtt az admin jelszavának hashelése
AdminSchema.pre('save', function(next) {

    const admin = this;

    if(admin.isModified('password')) {
        bcrypt.genSalt(10, function(error, salt) {
            if(error) return next('Hiba a bcrypt generálás közben!')
            bcrypt.hash(admin.password, salt, function(error, hash) {
                if(error) return next('Hiba a jelszó hashelése során!')
                admin.password = hash;
                return next();
            })
        })
    } else {
        console.log('A jelszó nem változott, nem kellett hashelni!');
        return next();
    }
}) 

// Két jelszó ellenőrzese
AdminSchema.methods.comparePasswords = function(password, next) {
    bcrypt.compare(password, this.password, function(error, isMatch) {
        return next(error, isMatch);
    })
}

mongoose.model('admin', AdminSchema);