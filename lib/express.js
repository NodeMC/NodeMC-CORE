/**
 * Load and Mount Express Routes.
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 **/

"use strict";

const express = require("express"),
      semver  = require("semver"),
      async   = require("async"),
      path    = require("path"),
      fs      = require("fs");

module.exports = class Express {

  /**
   * Express Dynamic Router.
   *
   * @param {Object} app    - express app
   * @param {Object} server - server system
   * @param {Object} ver    - API version
   * @param {Object} log    - our logger object
   *
   * @returns {Object} new class
   **/
  constructor(app, server, ver, log) {
    this.log   = log;
    this.app   = app;

    this.mountRoutes(app, server, "./backend/routes/", "v" + semver.major(ver));
  }

  /**
   * Mount Routes on Express APP.
   *
   * @param {Object} app    - express app.
   * @param {Object} server - server class
   * @param {String} dir    - directory to scan for routes.
   * @param {String} ver    - version to mount on.
   *
   * @returns {undefined} async
   **/
  mountRoutes(app, server, dir, ver) {
    let log   = this.log;

    async.waterfall([
      /**
       * Load Express Routes
       **/
      function(next) {
        let ROUTES = dir;

        fs.readdir(ROUTES, (err, list) => {
          if(err) {
            return next(err);
          }

          async.each(list, function(route, next) {
            let routes = ROUTES;
            if(!path.isAbsolute(ROUTES)) {
              routes = path.join("..", ROUTES);
            }

            let Path  = path.join(routes, route);
            let name  = path.parse(route).name;
            let mount = path.join("/", ver, "/", name).replace(/\\/g, "/");

            log("mount route", name, "on", mount);

            let eroute;
            try {
              eroute = require(Path);
            } catch(e) {
              return next(e);
            }

            // execute eroute "constructor"
            let router = eroute(new express.Router(), server);

            // Hook in the newly created route.
            app.use(mount, router);

            return next();
          }, err => {
            if(err) {
              return next(err);
            }

            return next();
          });
        })
      }
    ], err => {
      if(err) {
        throw err;
      }
    });
  }

  /**
   * Start Express.
   *
   * @param {Int} port - port to run on.
   *
   * @returns {boolean} Success.
   **/
  start(port) {
    let log   = this.log,
        app   = this.app;

    app.listen(port, (err) => {
      if(err) return log("Failed to Start Express.");
    })
  }
}
