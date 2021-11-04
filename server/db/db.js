const Sequelize = require('sequelize');
const pkg = require('../../package.json');

const databaseName = pkg.name;

const config = {
  logging: false,
};

const db = new Sequelize(`postgres://localhost:5432/${databaseName}`, config);
module.exports = db;
