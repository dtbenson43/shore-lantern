module.exports = (db) => {
  db.getAsync = (sql, params) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

  db.allAsync = (sql, params) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

  db.execAsync = (sql) => new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  return db;
}