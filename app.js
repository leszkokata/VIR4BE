const http = require('http');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const expressSession = require('express-session');
const mongoose = require('mongoose');
const config = require('./config/database');
const port = 8080;
const hostname = '127.0.0.1';

const app = express();

// Kapcsolódás a MongoDB adatbázishoz
require('./models/user.model');
require('./models/admin.model');

const userModel = mongoose.model('user');
const adminModel = mongoose.model('admin');


mongoose.connect(config.database);
mongoose.connection.on('connected', () => { console.log("Sikeres kapcsolódás az adatbázishoz!"); })
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connection.on('error', () => { console.log("Hiba a kapcsolódás folyamán!"); })


app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


// Ezekkel lépteti be a passport sessionbe a usert majd szedi ki onnan
passport.serializeUser((user, done) => {
    if(!user) return done("Felhasználó nem található!", undefined);
    return done(null, user);
});

passport.deserializeUser((user, done) => {
    if(!user) return done("Nincs felhasználó, akit kileptethetnenk!", undefined);
    return done(null, user);
});

passport.use('local', new localStrategy((username, password, done) => {

    userModel.findOne({ username: username }, function(err, user){
        if(err) return done('Hiba a user keresése során!', undefined)
        if(user) {
            user.comparePasswords(password, function(err, isMatch){
                if(err || !isMatch) return done('Helyelen jelszó vagy hiba az összehasonlitás során!', undefined)
                const state = 1;
                return done(null, user);
            })
        } else {
            adminModel.findOne({ username: username }, function(err, admin){
                if(err) return done('Hiba az admin keresése során!', undefined)
                if(admin) {
                    admin.comparePasswords(password, function(err, isMatch){
                        if(err || !isMatch) return done('Helyelen jelszó vagy hiba az összehasonlitás során!', undefined)
                        return done(null, admin);
                    })
                } else { return done("Hibás vagy nem létező felhasználónév!", undefined); }
            });
        };
    });

}));


app.use(expressSession({
    secret: 'hosszuhosszuhosszuszoveg',
    proxy: true,
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', require('./routes'));
//app.use(cors(corsOptions));
//app.use('/', cors(corsOptions), require('./routes'));

// Szerver inditasa
app.listen(port, () => { console.log('Fut a szerver a ' + port + ' porton!'); });
