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
            if(error) { return res.json( { success: false, message: 'Hiba a bejelentkezes kozben! ' + error } ); }
            else {
                // Ez hívja meg a serializeUser-t és hozza létre a sessiont
                req.logIn(user, (error) => {
                    if(error) return res.json( { success: false, message: 'Hiba a bejelentkezes kozben! ' + error } );
                    else if(user.permToJpg){ return res.json( { success: true, message: 'A user bejelentkezese sikeres!', name: user.name, username: user.email } ); }
                    else if(user.isAdmin){ return res.json( { success: true, message: 'Az admin bejelentkezese sikeres!', name: user.name ,username: user.email } ); }
                    else { return res.json( { success: false, message: 'Hiba a bejelentkezes kozben!' } ); }
                });
            }
        })(req, res);
    } else { return res.json( { success: false, message: 'Hiányzó email vagy jelszó!' } ); }
});

// Regisztrálási felület userek számára
router.route('/registerUser').get((req, res) => {
    return res.json( { success: true, message: 'Itt lehet regisztrálni userek számára!' } );
});

// Regisztrálási felület userek számára
router.route('/registerUser').post((req, res) => {

    if(req.body.name && req.body.email && req.body.password && req.body.permToJpg && req.body.permToPng && req.body.permToGif ) {

        const patient = new userModel({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            permToJpg: req.body.permToJpg,
            permToPng: req.body.permToPng,
            permToGif: req.body.permToGif
        });

        patient.save(function(error) {
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

    if(req.body.name && req.body.email && req.body.password && req.body.isAdmin) {

        const doctor = new adminModel({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            isAdmin: req.body.isAdmin
        });

        doctor.save(function(error) {
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
/*
// Kivalasztott user listazasa
router.route('/doctor/:patient').get((req, res) => {
    if(req.isAuthenticated()) {
        // Ha orvos
        if(req.user.profession){
            // Paciens neve, amiszerint kiolvassuk a mereseket es kilistazzuk
            var patient = req.params.patient;

            measurementModel.find({ patient: patient }, function(err, measurements) {
                if(err) return res.json( { success: false, message: 'Hiba a meresek listazasa folyaman!' + err } );
                return res.json( { success: true, message: measurements } );
            });
        } else { return res.json( { success: false, message: 'Nincs jogosultsaga az oldalhoz! Ehhez be kell jelentkeznie!' } ); }
    } else { return res.json( { success: false, message: 'Ehhez be kell jelentkeznie!' } ); }
});
*/
module.exports = router;