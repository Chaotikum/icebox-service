var persistence = require('../persistence/consumers.js');

exports.list = function(req, res) {
  console.log("list Consumers");

  persistence.getAllConsumers(function(consumers){
    res.json(consumers);
  });
};

exports.create = function(req, res) {
  console.log("created Consumer");

  var username = req.body.username;
  var contactmail = req.body.contactmail;

  persistence.insertNewConsumer(username, contactmail, function(username, contactmail, randomstring){
    //TODO: send mail to user with his secret string to be used in applications...
    console.log(randomstring);
    res.end();
  });
};

exports.show = function(req, res) {
  console.log("show Consumer");

  var username = req.params.username;
  persistence.getConsumersByName(username, function(consumer){
      res.json(consumer);
  });
};

exports.showSecret = function(req, res) {
  console.log("show Consumer with secret");

  var username = req.params.username;
  var randomsring = req.params.randomsring;
  persistence.getConsumersByNameWithSecret(username, randomsring, function(results){
    return res.json(results);
  });
};

