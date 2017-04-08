"use strict";

const path = require("path");

module.exports = () => {
  let config,
      cpath = path.join(__dirname, "../../config");

  try {
    config = require(path.join(cpath, "config.json"));
  } catch(e) {
    // using example config, this is ok.
    config = require(path.join(cpath, "config.example.js"));
  }

  return config;
}
