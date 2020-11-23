const supertest = require('supertest');
const server = require('../app');
const chai = require('chai');
const mongoUnit = require('mongo-unit');
const config = require('../config/database');
const mongoose = require('mongoose');
const userModel = mongoose.model('user');
const adminModel = mongoose.model('admin');



chai.should();

const api = supertest.agent(server);

describe('setup', () => {
  /*
  const testData = require('./testdb.json')
  beforeEach(() => mongoUnit.initDb(config.database, testData))
  afterEach(() => mongoUnit.drop())
 */

  before(function() {
    const admin = new adminModel({
    name:"Admin Jancsi",
    username:"probajancsi@proba.hu",
    password:"$2b$10$VDowGKTG7ffx9L8UwxT00O4l14bfUpHvHkDFEsyxV7zOu8O74D0Iy",
    isAdmin:true
    });

    admin.save();

    const user = new userModel({
      name:"Tomi",
      username:"probatomi@proba.hu",
      password:"$2b$10$pZheCksTb5RAnMGsINlbleS4Csy5W6F5E/uDdFoJWoGs.lD8hQkw2",
      permToJpg:true,
      permToPng:true,
      permToGif:true
    });

    user.save();

  });

  it('should login as admin', (done) => {
    api.post('/login')
      .set('Connetion', 'keep alive')
      .set('Content-Type', 'application/json')
      .type('form')
      .send({
        username: 'probajancsi@proba.hu',
        password: '1234'
      })
      .end((err, res) => {
        res.body.message.should.equal('Az admin bejelentkezese sikeres!');
        done();
      });
  });

  it('should login as user', (done) => {
    api.post('/login')
      .set('Connetion', 'keep alive')
      .set('Content-Type', 'application/json')
      .type('form')
      .send({
        username: 'probatomi@proba.hu',
        password: '1234'
      })
      .end((err, res) => {
        res.body.message.should.equal('A user bejelentkezese sikeres!');
        done();
      });
  });

  it('should logout', (done) => {
    api.post('/logout')
      .set('Connetion', 'keep alive')
      .set('Content-Type', 'application/json')
      .type('form')
      .send({
        username: 'probatomi@proba.hu'
      })
      .end((err, res) => {
        res.body.message.should.equal('Sikeres kijelentkezes!');
        done();
      });
  });

})