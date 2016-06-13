'use strict';

var dbURI = process.env.ICEBOX_DB || 'sqlite://development.sqlite';


var Sequelize = require('sequelize');


var db = exports.db = new Sequelize(dbURI);


var Drink = exports.Drink = db.define('drink', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  barcode: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  fullprice: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: { min: 0 },
  },
  discountprice: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: { min: 0 },
  },
  quantity: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  empties: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: { min: 0 },
  },
}, {
  validate: {
    checkDiscount: function() {
      if (this.fullprice < this.discountprice) {
        throw new Error('discountprice must be less or equal fullprice');
      }
    },
  },
  createdAt: false,
  updatedAt: false,
});

var Consumer = exports.Consumer = db.define('consumer', {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  ledger: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  avatarmail: {
    type: Sequelize.STRING,
    allowNull: true,
    validate: { isEmail: true },
  },
  vds: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
}, {
  createdAt: false,
  updatedAt: 'lastchange',
});

var Consumption = exports.Consumption = db.define('consumption', {
}, {
  createdAt: 'consumetime',
  updatedAt: false,
});

Consumption.belongsTo(Drink);
Drink.hasMany(Consumption);

Consumption.belongsTo(Consumer);
Consumer.hasMany(Consumption);
