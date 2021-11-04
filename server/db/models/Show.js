const Sequelize = require('sequelize');
const db = require('../db');

const Show = db.define('show', {
  name: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  imdbId: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  imageUrl: {
    type: Sequelize.STRING,
  },
  streaming: {
    type: Sequelize.STRING,
  },
  purchase: {
    type: Sequelize.STRING,
  },
});

module.exports = Show;
