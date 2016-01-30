var persistence = require('./persistence.js');
var client = persistence.client;

exports.consumeDrink = function(barcode) {
  client.query("UPDATE drinks SET quantity=(quantity-1) WHERE barcode=($1)", [barcode]);
}
