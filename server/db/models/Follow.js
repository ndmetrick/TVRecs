const Sequelize = require('sequelize');
const db = require('../db');

const Follow = db.define('follow', {});

module.exports = Follow;
