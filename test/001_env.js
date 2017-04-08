/**
 * Clean up configs.
 **/

"use strict";

const fs     = require("fs"),
      path   = require("path"),
      mkdirp = require("mkdirp");

const jar  = require("../lib/wrapper/serverjar.js");

const config     = require("./helpers/config.js")();

let cp = path.join(__dirname, "../config");
let cold = path.join(cp, "config.json");
let cnew = path.join(cp, "config.production.json");

describe("pre-test", () => {
  it("config assuredly contains no production config", (done) => {
    if(fs.existsSync(cnew) && fs.existsSync(cold)) {
      fs.unlinkSync(cold);
      return done();
    }

    if(fs.existsSync(cold)) {
      let nd = fs.createWriteStream(cnew);
      fs.createReadStream(cold).pipe(nd);

      nd.on("close", () => {
        fs.unlink(cold, () => {
          return done();
        })
      });
    } else {
      return done();
    }
  });

  it("minecraft dir exists", (done) => {
    if(!fs.existsSync(config.minecraft.dir)) {
      mkdirp.sync(config.minecraft.dir);
    }

    return done();
  });

  it("can download minecraft example version", (done) => {
    const flavour = config.minecraft.jar;
    const dir     = path.join(config.minecraft.dir);
    const version = config.minecraft.version;

    const saved   = path.join(dir, config.minecraft.jarfile);

    if(fs.existsSync(saved)) {
      return done();
    }

    jar(flavour, version, dir, (res) => {
      return done();
    })
  });
})
