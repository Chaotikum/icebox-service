var persistence = require('../persistence/consumers.js');

exports.list = function(req, res) {
  console.log("list Consumers");

  persistence.getAllConsumers(function(consumers) {
    res.json(consumers);
  });
};

exports.create = function(req, res) {
  console.log("created Consumer");

  var username = req.body.username;

  persistence.insertNewConsumer(username, function(consumer) {
    res.json(consumer);
  });
};

exports.show = function(req, res) {
  console.log("show Consumer");

  var username = req.params.username;
  persistence.getConsumersByName(username, function(consumer) {
    res.json(consumer);
  });
};

exports.destroy = function(req, res) {
  console.log("Delete Consumer");

  var username = req.params.username;
  persistence.deleteConsumerByName(username, function() {
    res.status(200);
    res.json({
      message: 'User deleted.'
    });
  });
};

exports.manipulate = function(req, res) {
  console.log("Manipulate Consumer");

  var username = req.params.username;
  var avatarmail = req.body.avatarmail;
  var vds = req.body.vds;

  persistence.manipulateConsumer(username, avatarmail, vds,
    function(consumer) {
      res.json(consumer);
    });
};

exports.addDeposit = function(req, res) {
  console.log("add Deposit");

  var username = req.params.username;
  var amount = req.body.amount;


  if (amount < 0) {
    res.status(422);
    res.json({
      message: 'Only positive amounts allowed.'
    });
  }

  persistence.addDeposit(username, amount, function(consumer) {
    res.json(consumer);
  })
};
