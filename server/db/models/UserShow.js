const Sequelize = require('sequelize');
const db = require('../db');

const User = db.define('userShows', {
  addedAt: {
    type: Sequelize.DATE,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
});

module.exports = User;
