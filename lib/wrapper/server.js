  /**
 * Server Module.
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license GPL3
 **/

"use strict";

const async   = require("async"),
      spawn   = require("child_process").spawn,
      mkdirp  = require("mkdirp"),
      path    = require("path"),
      pr      = require("properties-reader"),
      fs      = require("fs");

module.exports = class Server {
  constructor(config) {
    if(!config) {
      return null;
    }

    this.running = false;
    this.config  = config.nodemc
    this.log     = {}
    this.version = null;
    this.config  = config;

    // Create the WriteStream
    if(!fs.existsSync(config.nodemc.logDirectory)) {
      mkdirp.sync(config.nodemc.logDirectory);
    }

    this.log.path   = path.join(config.nodemc.logDirectory, "minecraft.log");
    this.log.route  = config.nodemc.logDirectory;
  }

  /**
   * Create a New Log Stream.
   *
   * @returns {undefined} or a Error on error...
   **/
  openLogStream() {
    this.log.stream = fs.createWriteStream(this.log.path, {
      flags: "w",
      defaultEncoding: "utf8",
      autoClose: false
    });
  }

  /**
   * Read the server.properties file.
   *
   * @returns {boolean/object} false on fail, or object on success
   **/
  getServerProps() {
    let srvprp;
    let props = path.join(this.config.minecraft.dir, "server.properties");
    try {
      srvprp = pr(props);
    } catch(e) {
      return false;
    }

    return srvprp;
  }

  /**
   * Start The Server
   *
   * @returns {undefined} nothing to return...
   **/
  startServer() {
    let config = this.config;

    console.log("debug:", "server start")
    this.openLogStream();

    this.running = true;
    this.spawn = spawn("java", [
        `-Xmx${config.minecraft.ram}`,
        `-Xms${config.minecraft.ram}`,
        "-jar",
        config.minecraft.jarfile,
        "nogui"
    ], {
      cwd: config.minecraft.dir
    });

    this.spawn.stdout.pipe(this.log.stream);
    this.spawn.stderr.pipe(this.log.stream);

    this.spawn.on("error", err => {
      return console.error("err:", err);
    });
    this.spawn.on("exit", code => {
      this.running = false;

      return console.info("java exited with code", code);
    });
  }

  /**
   * Restart The server
   *
   * @param {Function} next - callback
   * @returns {undefined} use the callback
   */
  restartServer(next) {
    let deffered = () => {
      let port = this.port;
      this.setport(port);
      this.startServer();

      if(next) {
        return next();
      }
    };

    if (this.running) {
      this.running = false;
      return this.stopServer("Restarting...", () => {
        return deffered();
      })
    }

    return deffered();
  }

  /**
   * Restart the server.
   *
   * @param {String} message - message to say why
   * @param {Function} next  - callback
   *
   * @returns {undefined} use callback
   **/
  stopServer(message, next) {
    this.execute(`say [NodeMC] ${message}`);
    this.spawn.kill("SIGTERM");
    this.spawn.on("exit", next);
  }

  /**
   * Set the Minecraft Port and Accept the EULA.
   *
   * @param {Int} port - port to set.
   * @todo Implement promise.
   * @returns {Promise} with then on success.
   **/
  setport(port) {
    async.waterfall([
      /**
       * Get The Server properties
       **/
      (next) => {
        let props = this.getServerProps(); // Get the original properties
        let fp    = path.join(this.config.minecraft.dir, "server.properties");

        if (props) {
          let oldport = props.get("server-port");

          // Here we set any minecraft server properties we need
          fs.readFile(fp, "utf8", function(err, data) {
            if (err) {
              return next(err);
            }

            let result = data.replace("server-port=" + oldport, "server-port=" + port);
            fs.writeFile(fp, result, "utf8", function(err) {
              if (err) return console.log(err);
            });
          });

          props = pr(fp); // Get the new properties

          return next(false, props);
        }

        return next("Failed To Get Server Properties");
      },

      /**
       * Modify the eula to accept it.
       **/
      (props, next) => {
        let fe    = path.join(this.config.minecraft.dir, "eula.txt");

        fs.readFile(fe, "utf8", function(err, data) {
            if (err) {
                return next(err);
            }

            let result = data.replace("eula=false", "eula=true");
            fs.writeFile(fe, result, "utf8", next);
        });
      }
    ], err => {
      if(err) {
        return err;
      }

      return true;
    })
  }

  /**
   * execute a command on the minecraft server
   *
   * @param {String} command - command to execute
   * @returns {boolean} success
   **/
  execute(command) {
    if(!this.running) {
      return false;
    }

    this.spawn.stdin.write(command + "\n");
    return true;
  }
}
