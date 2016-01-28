var express = require('express');
var app = express();
var fs = require("fs");
var pg = require('pg');

var connectionString = process.env.DATABASE_URL || 'postgres://iceboxuser:testForIce@localhost:5432/icobox';

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.post('/test-page', function(req, res) {
    //var name = req.body.name,
    console.log(req.body);
    var users = req.body;
    var user = users["user" + 2]
    console.log( user );

    res.end( JSON.stringify(user));
});

app.get('/listUsers', function (req, res) {
  console.log("1");
   fs.readFile( __dirname + "/" + "backup.json", 'utf8', function (err, data) {
       console.log( data );
       res.end( data );
   });
})

app.get('/lolTest2', function (req, res) {
  console.log("1");
  var client = new pg.Client(connectionString);
  client.connect();
  client.query("INSERT INTO items(text, complete) values($1, $2)", ["lol", true]);
  res.end("...");
})

app.get('/lolTest3', function (req, res) {
  console.log("1");
  var results = [];
  var client = new pg.Client(connectionString);
  client.connect();
  var query = client.query("SELECT * FROM items ORDER BY id ASC");
  query.on('row', function(row) {
    results.push(row);
  });
  query.on('end', function() {
    return res.json(results);
  });
})

/*routing.resources(app, controller_dir, "drinks", {}); // last param optional*/

app.put('/drinks/:id', function(req, res) {
    console.log("1-put Drink");
    var drinkId = req.params.id;

    var fullprice = req.body.fullprice;
    var discountprice = req.body.discountprice;

    var client = new pg.Client(connectionString);
    client.connect();
    var query = client.query("UPDATE drinks SET fullprice=($1), discountprice=($2) WHERE id=($3)", [fullprice, discountprice, drinkId]);
    res.end();
});

app.delete('/drinks/:id', function(req, res) {
    console.log("1-delete Drink");

    var drinkId = req.params.id;

    var client = new pg.Client(connectionString);
    client.connect();
    var query = client.query("DELETE FROM drinks WHERE id=($1)", [drinkId]);
    res.end();

});

app.get('/drinks/:id', function(req, res) {
  console.log("1-get Drink");
  var results = [];
  var drinkId = req.params.id;
  var client = new pg.Client(connectionString);
  client.connect();
  var query = client.query("SELECT name, barcode, fullprice, discountprice, quantity FROM drinks WHERE id=($1) ORDER BY id ASC", [drinkId]);
  query.on('row', function(row) {
    results.push(row);
  }, function(){console("loltest")});
  query.on('end', function() {
    return res.json(results);
  });
});

app.get('/drinks', function(req, res) {
  console.log("1-list Drinks");
  var results = [];
  var client = new pg.Client(connectionString);
  client.connect();
  var query = client.query("SELECT id, name, barcode, fullprice, discountprice, quantity FROM drinks ORDER BY id ASC");
  query.on('row', function(row) {
    results.push(row);
  });
  query.on('end', function() {
    return res.json(results);
  });
});

app.post('/drinks', function(req, res) {
    console.log("1-createDrink");
    var name = req.body.productname;
    var barcode = req.body.barcode;
    var fullprice = req.body.fullprice;
    var discountprice = req.body.discountprice;
    console.log(name);

    var client = new pg.Client(connectionString);
    client.connect();
    //TODO: sollte übrigens auch nicht zweimal existieren oder so... lol
    var query = client.query("INSERT INTO drinks(name, barcode, fullprice, discountprice, quantity) values($1, $2, $3, $4, $5)", [name, barcode, fullprice, discountprice, 0]);

    query.on('end', function() {
      client.end();
      return;
    });
    res.end();
});

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  updateTables();

  console.log("Example app listening at http://%s:%s", host, port)
})

function updateTables() {
  updateDepotTables();
  updateDrinkTables();
}

function updateDepotTables() {
  var client = new pg.Client(connectionString);
  client.connect();
  var query = client.query('CREATE TABLE IF NOT EXISTS depot(id SERIAL PRIMARY KEY, name VARCHAR(200) not null)');
  //TODO: sollte man auch gleich füllen...
  query.on('end', function() {
    client.end();
    return;
  });
}

function updateDrinkTables() {
  var client = new pg.Client(connectionString);
  client.connect();
  //var query = client.query('DROP TABLE drinks');
  var query = client.query('CREATE TABLE IF NOT EXISTS drinks(id SERIAL PRIMARY KEY, name VARCHAR(200) not null, barcode VARCHAR(200) not null, fullprice INTEGER not null, discountprice INTEGER not null, quantity INTEGER not null)');
  query.on('end', function() {
    client.end();
    return;
  });
}
