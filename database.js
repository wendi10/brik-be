const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  database: "test",
  user: "root",
  password: "password",
});

module.exports = connection;
