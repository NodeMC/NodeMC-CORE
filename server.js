/**
 * This is the sourcecode for the NodeMC control
 * panel software - it is a web server that runs on a specific
 * port.
 *
 * If you have any questions feel free to ask either on Github or
 * email: gabriel@nodemc.space!
 *
 * (c) Gabriel Simmer 2016
 *
 * Todo:
 * md5sum check for jarfiles
 * File uploading from HTML5 dashboard
 * Self-updater (possible?)
 * Support for other flavours of Minecraft server
 * General dashboard overhaul for sleeker appearence
 *     - Server stats
 *     - Other info on index.html
 *
 * @author Gabriel Simmer <gabreil@nodemc.space>
 * @version 1.0.0
 * @license GPL3
 **/

"use strict";

// string hijack
require("colors")

// Requires
const path              = require("path");
const express           = require("express");
const fs                = require("fs-promise");
const mkdirp            = require("mkdirp");
const FileStreamRotator = require("file-stream-rotator");
const semver            = require("semver");

// Express JS Modules
const cors              = require("cors");
const morgan            = require("morgan");
const bodyP             = require("body-parser");
const normalize         = require("./lib/normalize.js");

// Internal Modules.
const Server            = require("./lib/wrapper/server.js");
const Routes            = require("./lib/express.js");
const Update            = require("./lib/autoupdate.js");
const PluginLoader      = require("./lib/plugin/loader.js");
const PluginAPI         = require("./lib/plugin/api.js");
const Logger            = require("./lib/logger.js");

// config for now.
const config      = require("./config/config.js")

console.log("By default NodeMC doesn\'t output to console.")
console.log("You can view it\'s inner debugging, with DEBUG='nodemc:<component>'")
console.log("or enable all debug output with DEBUG='nodemc:*'\n")

// async wrapper
const init = async () => {

  const dashboard    = config.dashboard;
  const logDirectory = config.nodemc.logDirectory;

  // instance the server
  let app = new express();
  let server = new Server(config)
  let updater = new Update();

  // Check NodeMC version.
  updater.checkVersion(config.nodemc.version.core);

  // Extra fs call, but doesn't require logic.
  mkdirp.sync(logDirectory);

  let logFile   = path.join(logDirectory, "/access-%DATE%.log");
  const logger  = FileStreamRotator.getStream({
    filename: logFile,
    frequency: "daily",
    verbose: false,
    date_format: "YYYY-MM-DD"
  });

  // static files
  if(config.firstrun) {
    app.use("/", express.static(dashboard.setup));
  } else {
    app.use("/", express.static(dashboard.dashboard));
  }

  // Check dashboard version
  const data = await fs.readFile(path.join(dashboard.dashboard, "compat.txt"));
  if(!semver.satisfies(config.nodemc.version.rest, data)) {
    console.error("The installed dashboard does not appear to support this version of NodeMC!".red);
    console.error("You may encounter issues with this dashboard - if so, please report this to the dashboard's developer.".red);
  }

  app.use(cors());
  app.use(bodyP.json());
  app.use(bodyP.urlencoded({
    extended: false
  }));
  app.use(normalize);
  app.use(morgan("common", {
      stream: logger
  }));

  // Build the Express Routes.
  let routes = new Routes(app, server, config.nodemc.version.rest, require("debug")("nodemc:express"));

  console.log(`NodeMC started on :${config.nodemc.port}`)
  routes.start(config.nodemc.port);

  // Initialise plugin system
  let pLogger = new Logger("plugins"),
    pAPI = new PluginAPI.PluginAPI(pLogger),
    pLoader = new PluginLoader(pLogger, pAPI);
}

init();
