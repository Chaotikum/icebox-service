var pg = require('pg');

var iceboxhost = process.env.ICEBOX_DB_HOST;
var iceboxport = process.env.ICEBOX_DB_PORT;
var iceboxuser = process.env.ICEBOX_DB_USER;
var iceboxpsw = process.env.ICEBOX_DB_PSW;
var iceboxname = process.env.ICEBOX_DB_NAME;

var connectionConfig = {};

if(iceboxuser) {
connectionConfig = {
    host: iceboxhost || 'localhost',
    port: iceboxport || 5432,
    user: iceboxuser,
    password: iceboxpsw,
    database: iceboxname
  };
} else {
connectionConfig = {
    host: 'localhost',
    port: 5432,
    user: 'iceboxuser',
    password: 'testForIce',
    database: 'icobox'
  };
}

namespace('db', function() {

  desc('Create tables');
  task('create', function() {
    console.log('Create tables');

    var client = new pg.Client(connectionConfig);
    client.connect(function(err) {
      if (err) {
        return console.error('Could not connect to postgres', err);
      }

      client.query(
        'CREATE TABLE IF NOT EXISTS drinks (' +
        'id SERIAL PRIMARY KEY, ' +
        'name VARCHAR(200) not null UNIQUE, ' +
        'barcode VARCHAR(200) not null UNIQUE, ' +
        'fullprice INTEGER not null CONSTRAINT positive_fullprice CHECK (fullprice > 0), ' +
        'discountprice INTEGER not null CONSTRAINT positive_disocuntprice CHECK (discountprice > 0 AND fullprice >= discountprice), ' +
        'quantity INTEGER not null CONSTRAINT positive_quantity CHECK (quantity >= 0), ' +
        'empties INTEGER not null CONSTRAINT positive_empties CHECK (empties >= 0))',
        function(err) {
          if(err) {
            return console.error('error creating drinks table', err);
          }
          console.log('Created drinks table');
        });

      client.query(
        'CREATE TABLE IF NOT EXISTS consumers (' +
        'id SERIAL PRIMARY KEY, ' +
        'username VARCHAR(200) not null UNIQUE, ' +
        'ledger INTEGER not null CONSTRAINT positive_ledger CHECK (ledger >= 0), ' +
        'avatarmail VARCHAR(254), ' +
        'vds BOOLEAN, ' +
        'lastchange TIMESTAMP DEFAULT current_timestamp)',
        function(err) {
          if(err) {
            return console.error('error creating consumers table', err);
          }
          console.log('Created consumers table');
        });

      client.query(
        'CREATE TABLE IF NOT EXISTS consumptions (' +
        'id SERIAL PRIMARY KEY, ' +
        'consumetime TIMESTAMP DEFAULT current_timestamp, ' +
        'consumer_id SERIAL REFERENCES consumers (id), ' +
        'drink_id SERIAL REFERENCES drinks (id)), '+
        'payment INTEGER not null DEFAULT 0',
        function(err) {
          if(err) {
            return console.error('error creating consumptions table', err);
          }
          console.log('Created consumptions table');
        });

      client.query(
        'INSERT INTO consumers (username, ledger, vds) ' +
        'VALUES (\'Anon\', 0, true)',
        function(err) {
          if(err) {
            return console.error('error creating Anon user', err);
          }
          console.log('Created Anon user');
        });
    });

    client.on('drain', client.end.bind(client));
  });

  desc('Insert new payment column into consumption table if needed');
  task('addPayment', function() {
    console.log('Add payment to consumption')

    var client = new pg.Client(connectionConfig);
    client.connect(function(err) {
      if (err) {
        return console.error('Could not connect to postgres', err);
      }

      client.query(
        'ALTER TABLE consumptions ADD COLUMN payment INTEGER not null DEFAULT 0',
        function(err) {
          if(err) {
            return console.error('error adding table', err);
          }
          console.log('Created new comumn');
        });
        client.on('drain', client.end.bind(client));
      });
  });

  desc('Insert seed data');
  task('seed', function() {
    console.log('Insert seed data');

    var client = new pg.Client(connectionConfig);
    client.connect(function(err) {
      if (err) {
        return console.error('Could not connect to postgres', err);
      }

      client.query(
        'INSERT INTO consumers (username, ledger, vds)' +
        'VALUES ' +
          '(\'tvluke\', 375, true), ' +
          '(\'bülülülüp\', 125, true),' +
          '(\'jonnyT\', 250, true)',
        function(err) {
          if(err) {
            return console.error('error creating sample users', err);
          }
          console.log('Created sample users');
        });

      client.query(
        'INSERT INTO drinks (name, barcode, fullprice, discountprice, quantity, empties)' +
        'VALUES ' +

          '(\'viva con Agua laut\', \'4027109007880\', 150, 125, 200, 0),' +
          '(\'viva con Agua leise\', \'4027109007897\', 150, 125, 200, 0),' +
          '(\'Sophie Classic\', \'4001228512777\', 150, 125, 200, 0),' +
          '(\'Sophie Leise\', \'4001228512791\', 150, 125, 200, 0),' +

          '(\'flora power\', \'4260031874056\', 150, 125, 200, 0),' +
          '(\'Mio Mate\', \'4002846034504\', 150, 125, 200, 0),' +
          '(\'Club Mate\', \'4029764001807\', 150, 125, 200, 0),' +

          '(\'Wostok Birne (0.3l)\', \'4260189210072\', 150, 125, 200, 0),' +
          '(\'Wostok Tanne (0.3l)\', \'426018210010\', 150, 125, 200, 0),' +
          '(\'Wostok Aprikose (0.3l)\', \'4260189210096\', 150, 125, 200, 0),' +
          '(\'Wostok Plaume (0.3l)\', \'4260189210614\', 150, 125, 200, 0),' +
          '(\'Wostok Dattel (0.5l)\', \'4260189210041\', 150, 125, 200, 0),' +
          '(\'Wostok Grün (0.5l)\', \'4260189210065\', 150, 125, 0, 0),' +

          '(\'fritz-kola Kaffee\', \'4260107220039\', 150, 125, 200, 0),' +
          '(\'fritz-limo Orange\', \'4260107220114\', 150, 125, 200, 0),' +
          '(\'fritz-limo Zitrone\', \'4260107220077\', 150, 125, 200, 0),' +
          '(\'fritz-spritz Apfel\', \'4260107222514\', 150, 125, 200, 0),' +

          '(\'Premium Cola (0.5l)\', \'4260199999999\', 150, 125, 200, 0),' +

          '(\'Müllers Malz\', \'4023216000110\', 150, 125, 200, 0),' +

          '(\'Paulaner Hefe\', \'4066600641919\', 150, 125, 200, 0)',
        function(err) {
          if(err) {
            return console.error('error creating sample drinks', err);
          }
          console.log('Created sample drinks');
        });

      client.on('drain', client.end.bind(client));
    });
  });

  desc('Drop database');
  task('drop', function() {
    console.log('Drop tables');

    var client = new pg.Client(connectionConfig);
    client.connect(function(err) {
      if (err) {
        return console.error('could not connect to postgres', err);
      }

      client.query('DROP TABLE IF EXISTS drinks, consumers, consumptions',
        function(err) {
          if(err) {
            return console.error('error running query', err);
          }
          console.log('Dropped all tables');
        });

      client.on('drain', client.end.bind(client));
    });
  });

});
