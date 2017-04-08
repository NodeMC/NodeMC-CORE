/**
 * Authentication Middleware.
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license GPL3
 **/

"use strict";

/**
 * Determine if API key is valid.
 *
 * @param {Object} config - NodeMC Config Object.
 * @param {String} auth - Attempted api Key
 * @returns {Boolean} Valid API Key or not.
 **/
let isValid = (config, auth) => {
  let apikey = config.nodemc.apikey;

  return auth === apikey
};

module.exports = (config) => {
  if(config.config) config = config.config; // for routers

  /**
   * Auth Middleware
   *
   * @param {Object} req - ExpressJS Request Object.
   * @param {Object} res - ExpressJS Response Object.
   * @param {Function} next - callback.
   * @returns {Undefined} Nothing to return.
   **/
  return (req, res, next) => {
    let capikey = req.params.apikey || req.body.apikey || req.get("Authentication");

    if(isValid(config, capikey)) {
      return next();
    }

    return res.error("invalid_authentication", {
      moreinfo: "API Key was invalid or not supplied correctly"
    });
  }
}
