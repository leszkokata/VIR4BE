const router = require('express').Router();
const passport = require('passport');
const fs = require('fs');
const mongoose = require('mongoose');
const userModel = mongoose.model('user');
const adminModel = mongoose.model('admin');

// Bejelentkező képernyő
router.route('/login').post((req, res) => {
    if(req.body.username && req.body.password) {
        passport.authenticate('local', (error, user) => {
            if(error) { return res.json( { success: false, message: 'Hiba a bejelentkezes soran! ' + error } ); }
            else {
                // Ez hívja meg a serializeUser-t és hozza létre a sessiont
                req.logIn(user, (error) => {
                    if(error) return res.json( { success: false, message: 'Hiba a bejelentkezes kozben! ' + error } );
                    else if(user.permToJpg){ return res.json( { success: true, message: 'A user bejelentkezese sikeres!', name: user.name, username: user.username } ); }
                    else if(user.isAdmin){ return res.json( { success: true, message: 'Az admin bejelentkezese sikeres!', name: user.name ,username: user.username } ); }
                    else { return res.json( { success: false, message: 'Hiba a bejelentkezes kozben!' } ); }
                });
            }
        })(req, res);
    } else { return res.json( { success: false, message: 'Hiányzó username vagy jelszó!' } ); }
});

// Regisztrálási felület userek számára
router.route('/registerUser').get((req, res) => {
    return res.json( { success: true, message: 'Itt lehet regisztrálni userek számára!' } );
});

// Regisztrálási felület userek számára
router.route('/registerUser').post((req, res) => {

    if(req.body.name && req.body.username && req.body.password && req.body.permToJpg && req.body.permToPng && req.body.permToGif ) {

        const user = new userModel({
            name: req.body.name,
            username: req.body.username,
            password: req.body.password,
            permToJpg: req.body.permToJpg,
            permToPng: req.body.permToPng,
            permToGif: req.body.permToGif
        });

        user.save(function(error) {
            if(error) return res.json( { success: false, message: 'Sikertelen regisztracio! Hiba: '+ error } );
            return res.json( { success: true, message: 'Sikeres regisztráció!!' } );
        });
        
    } else { return res.json( { success: false, message: 'Sikertelen regisztráció! Valamelyik adat hiányzik!' } ); }
});

// Regisztrálási felület adminok számára
router.route('/registerAdmin').get((req, res) => {
    return res.json( { success: true, message: 'Itt lehet regisztrálni adminok számára!' } );
});

// Regisztrálási felület orvosok számára
router.route('/registerAdmin').post((req, res) => {

    if(req.body.name && req.body.username && req.body.password && req.body.isAdmin) {

        const admin = new adminModel({
            name: req.body.name,
            username: req.body.username,
            password: req.body.password,
            isAdmin: req.body.isAdmin
        });

        admin.save(function(error) {
            if(error) return res.json( { success: false, message: 'Sikertelen regisztracio! Hiba: ' + error } );
            return res.json( { success: true, message: 'Sikeres regisztráció!' } );
        });
        
    } else { return res.json( { success: false, message: 'Sikertelen regisztráció! Valamelyik adat hiányzik!' } ); }
});

// Kijelentkezes
router.route('/logout').post((req, res) => {
    if(req.isAuthenticated()) {
        req.logout();
        return res.json( { success: true, message: 'Sikeres kijelentkezes!' } );
    } else { return res.json( { success: false, message: 'Elobb be kell jelentkezni, hogy utana kijelentkezhess!' } ); }
});

// Felhasznalok permission adatainak lekerese
router.route('/admin/getpermissondata').get((req, res) => {
    if(req.isAuthenticated()) {
        // Ha admin akkor megnezheti
        if(req.user.isAdmin){
            userModel.find({}, function(err, userdata) {
                if(err) return res.json( { success: false, message: 'Hiba az adatok listazasa folyaman!' + err } );
                return res.json( { success: true, message: userdata } );
            });
        } else { return res.json( { success: false, message: 'Nincs jogosultsaga az oldalhoz! Ehhez be kell jelentkeznie!' } ); }
    } else { return res.json( { success: false, message: 'Ehhez be kell jelentkeznie!' } ); }
});

// Felhasznalok permission adatainak lekerese
router.route('/user/getpermissondata').get((req, res) => {
    if(req.isAuthenticated()) {
            userModel.find({username: req.user.username }, function(err, data) {
                if(err) return res.json( { success: false, message: 'Hiba az adatok listazasa folyaman!' + err } );
                return res.json( { success: true, message: data } );
            });
       
    } else { return res.json( { success: false, message: 'Ehhez be kell jelentkeznie!' } ); }
});


// Felhasznalok permission adatainak valtoztatasa
router.route('/admin/setpermissondata').put((req, res) => {
    if(req.isAuthenticated()) {
        // Ha admin akkor valtoztathat
        if(req.user.isAdmin){                
            userModel.findOneAndUpdate({username : req.body.username}, {permToJpg: req.body.permToJpg, permToPng: req.body.permToPng, permToGif: req.body.permToGif}, function(error, object){ 
                if(error){
                    return res.json( { success: false, message: "Nem sikerult a modositas! error:"+ error } );
                }
            } );

        } else { return res.json( { success: false, message: 'Nincs jogosultsaga az oldalhoz! Ehhez be kell jelentkeznie!' } ); }
    } else { return res.json( { success: false, message: 'Ehhez be kell jelentkeznie!' } ); }

});

module.exports = router;