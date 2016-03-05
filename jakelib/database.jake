var pg = require('pg');
var client = new pg.Client({
  user: 'iceboxuser',
  password: 'testForIce',
  database: 'icobox'
});

namespace('db', function() {

  desc('Create database');
  task('create', function(){
    console.log('Create database');

    client.connect(function(err) {
      if (err !== null) {
        console.log(err);
      }
    });

    client.query('CREATE TABLE IF NOT EXISTS drinks (' +
      'id SERIAL PRIMARY KEY, ' +
      'name VARCHAR(200) not null UNIQUE, ' +
      'barcode VARCHAR(200) not null UNIQUE, ' +
      'fullprice INTEGER not null CONSTRAINT positive_fullprice CHECK (fullprice > 0), ' +
      'discountprice INTEGER not null CONSTRAINT positive_disocuntprice CHECK (discountprice > 0 AND fullprice >= discountprice), ' +
      'quantity INTEGER not null CONSTRAINT positive_quantity CHECK (quantity >= 0), ' +
      'empties INTEGER not null CONSTRAINT positive_empties CHECK (empties >= 0))');

    client.query('CREATE TABLE IF NOT EXISTS consumer (' +
      'id SERIAL PRIMARY KEY, ' +
      'username VARCHAR(200) not null UNIQUE, ' +
      'ledger INTEGER not null CONSTRAINT positive_ledger CHECK (ledger >= 0), ' +
      'avatarmail VARCHAR(254), ' +
      'vds BOOLEAN)');

    client.query('CREATE TABLE IF NOT EXISTS consumption (' +
      'id SERIAL PRIMARY KEY, ' +
      'consumetime TIMESTAMP DEFAULT current_timestamp, ' +
      'consumer_id SERIAL REFERENCES consumer (id), ' +
      'drink_id SERIAL REFERENCES drinks (id))');

      client.query('INSERT INTO consumer (username, ledger, vds) VALUES (\'Anon\', 0, true)');

    client.on('drain', client.end.bind(client));
  });

  desc('Example Data');
  task('example', function(){
    console.log('Create Example Data');
    client.connect(function(err) {
      if (err !== null) {
        console.log(err);
      }
    });

    client.query('INSERT INTO consumer (username, ledger, vds) VALUES (\'tvluke\', 375, true)');
    client.query('INSERT INTO consumer (username, ledger, vds) VALUES (\'bülülülüp\', 125, true)');
    client.query('INSERT INTO consumer (username, ledger, vds) VALUES (\'jonnyT\', 250, true)');

    client.query('INSERT INTO drinks (name, barcode, fullprice, discountprice, quantity, empties) VALUES (\'flora power\', \'4260031874056\', 150, 125, 200, 0)');
    client.query('INSERT INTO drinks (name, barcode, fullprice, discountprice, quantity, empties) VALUES (\'viva con Agua laut\', \'4027109007880\', 150, 125, 200, 0)');
    client.query('INSERT INTO drinks (name, barcode, fullprice, discountprice, quantity, empties) VALUES (\'viva con Agua leise\', \'4027109007897\', 150, 125, 200, 0)');
    client.query('INSERT INTO drinks (name, barcode, fullprice, discountprice, quantity, empties) VALUES (\'Mio Mate\', \'4002846034504\', 150, 125, 200, 0)');
    client.query('INSERT INTO drinks (name, barcode, fullprice, discountprice, quantity, empties) VALUES (\'Club Mate\', \'4029764001807\', 150, 125, 200, 0)');
    client.query('INSERT INTO drinks (name, barcode, fullprice, discountprice, quantity, empties) VALUES (\'Wostok Birne (0.3l)\', \'4260189210072\', 150, 125, 200, 0)');
    client.query('INSERT INTO drinks (name, barcode, fullprice, discountprice, quantity, empties) VALUES (\'Wostok Tanne (0.3l)\', \'426018210010\', 150, 125, 200, 0)');
    client.query('INSERT INTO drinks (name, barcode, fullprice, discountprice, quantity, empties) VALUES (\'Wostok Aprikose (0.3l)\', \'4260189210096\', 150, 125, 200, 0)');
    client.query('INSERT INTO drinks (name, barcode, fullprice, discountprice, quantity, empties) VALUES (\'Wostok Dattel (0.5l)\', \'4260189210041\', 150, 125, 200, 0)');
    client.query('INSERT INTO drinks (name, barcode, fullprice, discountprice, quantity, empties) VALUES (\'Wostok Grün (0.5l)\', \'4260189210065\', 150, 125, 0, 0)');

    client.query('INSERT INTO drinks (name, barcode, fullprice, discountprice, quantity, empties) VALUES (\'fritz-kola Kaffee\', \'4260107220039\', 150, 125, 200, 0)');
    client.query('INSERT INTO drinks (name, barcode, fullprice, discountprice, quantity, empties) VALUES (\'fritz-limo Orange\', \'4260107220114\', 150, 125, 200, 0)');
    client.query('INSERT INTO drinks (name, barcode, fullprice, discountprice, quantity, empties) VALUES (\'fritz-limo Zitrone\', \'4260107220077\', 150, 125, 200, 0)');

    client.query('INSERT INTO drinks (name, barcode, fullprice, discountprice, quantity, empties) VALUES (\'Premium Cola (0.5l)\', \'4260199999999\', 150, 125, 200, 0)');

    client.query('INSERT INTO drinks (name, barcode, fullprice, discountprice, quantity, empties) VALUES (\'Müllers Malz\', \'4023216000110\', 150, 125, 200, 0)');
    client.query('INSERT INTO drinks (name, barcode, fullprice, discountprice, quantity, empties) VALUES (\'Paulaner Hefe\', \'4066600641919\', 150, 125, 200, 0)');
    client.on('drain', client.end.bind(client));
  });

  desc('Drop database');
  task('drop', function(){
    console.log('Drop database');

    client.connect(function(err) {
      if (err !== null) {
        console.log(err);
      }
    });

    client.query('DROP TABLE IF EXISTS alias');
    client.query('DROP TABLE IF EXISTS consumption');
    client.query('DROP TABLE IF EXISTS  drinks');
    client.query('DROP TABLE IF EXISTS  consumer');


    client.on('drain', client.end.bind(client));
  });
//
//  desc('Seed database');
//  task('seed', function() {
//    console.log('Seed database');
//
//    var users = [];
//
//    // Create an array of 100 fake users
//    _.times(100, function() {
//      users.push({
//        username: faker.internet.userName(),
//        email:    faker.internet.email(),
//        password: faker.internet.password()
//      });
//    });
//  });
//
});
