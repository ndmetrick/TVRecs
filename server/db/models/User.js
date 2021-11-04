const Sequelize = require('sequelize');
const db = require('../db');

const UserShow = db.define('users', {
  username: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  auth0Id: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
});

module.exports = User;
