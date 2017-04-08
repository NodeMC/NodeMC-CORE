/**
 * (c) NodeMC
 *
 * Standardize NodeMC API responses.
 **/

module.exports = (req, res, next) => {
  /**
   * Send A API conforment response
   *
   * @param {Anything} data  - data to send.
   *
   * @returns {Res#Send} express res.send
   **/
  res.success = (data) => {
    return res.send({
      success: true,
      data: data
    });
  }

  /**
   * Send A API conforment error.
   *
   * @param {String} message - error message
   * @param {Anything} data  - data to send.
   *
   * @returns {Res#Send} express res.send
   **/
  res.error = (message, data) => {
    return res.send({
      success: false,
      message: message,
      data: data
    })
  }

  return next();
}
