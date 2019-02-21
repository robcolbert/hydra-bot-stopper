// hydra-module.js
// Copyright (C) 2019 Gab AI, Inc.
// License: MIT

'use strict';

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

module.exports.initialize = ( ) => {
  return new Promise((resolve, reject) => {
    const dataFilename = path.join(__dirname, 'data', 'urls.txt');
    fs.readFile(dataFilename, { encoding: 'utf-8' }, (err, fileData) => {
      if (err) {
        return reject(err);
      }
      module.urls = fileData
      .split('\n')
      .map((url) => {
        return url.trim();
      });
      try {
        module.db = new sqlite3.Database(':memory:');
        module.db.serialize(( ) => {
          module.db.run('CREATE TABLE urls (url VARCHAR(255) UNIQUE)');

          var stmt = module.db.prepare('INSERT INTO urls VALUES (?)');
          module.urls.forEach((url) => {
            stmt.run(url);
          });
          stmt.finalize();
        });
        return resolve();
      } catch (error) {
        return reject(error);
      }
    });
  });
};

module.exports.urlblocker = (options = { }) => {
  var defaults = {
    guardedUrls: [ ]
  };

  options = Object.assign(defaults, options);

  return (req, res, next) => {
    if (!module.db) {
      return next();
    }

    module.db.get('SELECT COUNT(*) AS count FROM urls WHERE url = ?', req.url, (err, result) => {
      if (result.count === 0) {
        return next();
      }
      var viewModel = { };
      var jobs = [ ];

      if (options.auditRequest && (typeof options.auditRequest === 'function')) {
        jobs.push(options.auditRequest(req).then((audit) => { viewModel.audit = audit; }));
      }

      Promise
      .all(jobs)
      .then(( ) => {
        return res.status(200).json(viewModel);
      })
      .catch(next);
    });
  };
};