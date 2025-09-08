import sqlite3 from "sqlite3";

const sqlite = new sqlite3.Database("./taskmanager.db");

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqlite.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqlite.get(sql, params, function (err, row) {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqlite.all(sql, params, function (err, rows) {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

export default { run, get, all };
