'use strict';

var should = require("should");
var request = require("supertest");

var app = require('../../app');

describe("drinks collection resource", function() {
  describe("GET /drinks", function() {
    it("returns a list of drinks", function(done) {
      request(app)
      .get("/drinks")
      .expect(200)
      .expect("Content-type", /json/)
      .end(function(err, res) {
        should.not.exist(err);

        res.body.should.be.an.instanceOf(Array);
        res.body[0].should.have.property("name");
        res.body[0].should.have.property("empties");

        done();
      });
    });
  });

  describe("POST /drinks", function() {
    it("creates a new drink", function(done) {
      request(app)
      .post("/drinks")
      .set("Content-type", 'application/json')
      .send( {
        "name": "Awesome New Drink",
        "barcode": "11111111111111",
        "fullprice": 150,
        "discountprice": 125,
        "quantity": 200,
        "empties": 0 })
      .expect(201)
      .expect("Content-type", /json/)
      .end(function(err, res){
        should.not.exist(err);

        done();
      });
    });
  });
});

describe("drink entity resource", function() {
  describe("GET /drinks/:barcode", function() {
    it.skip("returns the drink", function(done) {
      request(app)
      .get("/drinks/KAFFEE")
      .expect(200)
      .expect("Content-type", /json/)
      .end(function(err, res) {
        should.not.exist(err);

        res.body.should.be.an.instanceOf(Object);
        res.body.should.have.property("barcode");
        res.body.barcode.should.be("KAFFEE");
        res.body.should.have.property("name");
        res.body.should.have.property("empties");

        done();
      });
    });
  });
  
  describe("UPDATE /drinks/:barcode", function() {
    it.skip("updates the drink", function(done) {
      request(app)
      .update("/drinks/KAFFEE")
      .send( {
        "name": "Super New Drink",
        "barcode": "11111111111111",
        "fullprice": 150,
        "discountprice": 125,
        "quantity": 180,
        "empties": 20 })
      .expect(200)
      .expect("Content-type", /json/)
      .end(function(err, res) {
        should.not.exist(err);

        res.body.should.be.an.instanceOf(Object);
        res.body.should.have.property("barcode");
        res.body.barcode.should.be("KAFFEE");
        res.body.should.have.property("name");
        res.body.should.have.property("empties");

        done();
      });
    });
  });
  
  describe("DELETE /drinks/:barcode", function() {
    it.skip("removes the drink from the store", function(done) {
      request(app)
      .delete("/drinks/KAFFEE")
      .expect(204)
      .expect("Content-type", /json/)
      .end(function(err, res) {
        should.not.exist(err);

        res.body.should.not.exist();

        done();
      });
    });
  });
});
