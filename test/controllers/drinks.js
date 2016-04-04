'use strict';

var should = require("should");
var supertest = require("supertest");

var server = supertest(require('../../server'));


describe("drinks collection resource", function() {
  describe("GET /drinks", function() {
    it("responds with 200 OK", function(done) {
      server.get("/drinks")
      .expect(200, done);
    });
    it("responds with json", function(done) {
      server.get("/drinks")
      .expect("Content-type", /json/, done);
    });
    it("returns list of drinks", function(done) {
      server.get("/drinks")
      .end(function(err, res) {
        res.body.should.be.an.instanceOf(Array);
        res.body[0].should.have.property("name");
        res.body[0].should.have.property("empties");

        done();
      });
    });
  });

  describe("POST /drinks", function() {
    it("responds with 201 CREATED", function(done) {
      server
      .post("/drinks")
      .send( {
        "name": "Awesome New Drink",
        "barcode": "11111111111111",
        "fullprice": 150,
        "discountprice": 125,
        "quantity": 200,
        "empties": 0 })
      .expect(201, done);
    });

    it("responds with json", function(done) {
      server
      .post("/drinks")
      .send( {
        "name": "Awesome New Drink",
        "barcode": "11111111111111",
        "fullprice": 150,
        "discountprice": 125,
        "quantity": 200,
        "empties": 0 })
      .expect("Content-type", /json/, done);
    });

    it.skip("creates a new drink", function(done) {
      server
      .post("/drinks")
      .send( {
        "name": "Awesome New Drink",
        "barcode": "11111111111111",
        "fullprice": 150,
        "discountprice": 125,
        "quantity": 200,
        "empties": 0 })
      .end(function(err, res){

        done();
      });
    });
  });
});
