/**
* Auto-update module.
*
* @author NodeMC Team
* @license GPL3
*
* HACK: using child_process over, say, libgit...
**/

"use strict";

const spawn   = require("child_process").exec // HACK: spawn != exec
const request = require("request-promise-native")
const semver  = require("semver")
const debug   = require("debug")("nodemc:autoupdate");

module.exports = class Updater {

	/**
	 * Check the version of NodeMC.
	 *
	 * @param {String} current - Current NodeMC version
	 * @returns {Boolean} true if needs update.
	 **/
	async checkVersion(current) {
		debug("checkVersion", `Current version: ${current}`);

		const version = await request({
			method: "GET",
			uri: "https://raw.githubusercontent.com/NodeMC/NodeMC-CORE/master/version.txt"
		})

		// Fix old version bug...
		if(!semver.valid(version)) {
			debug("checkVersion", `'${version}' is not a valid semver version`)
			return false;
		}

		if(semver.lt(current, version)) {
			console.log("NodeMC is not up-to-date.");
			console.log(`Your version: ${current}\nNewest version: ${version}`);
			return true
		}
	}

	/**
	 * git pull latest version of NodeMC from master.
	 *
	 * @todo move checkVersion over here
	 * @todo implement update for binary
	 *
	 * @param {success} callback - Callback on success or failure
	 * @returns {Undefined} use callback
	 **/
	updateGit(callback) {
		const gp = spawn("git pull origin master", { cwd: "../tmp" });

		console.log("Attempting to update from git...");

		// HACK: Doesn't remove listener after fired.
		gp.stdout.on("data", (data) => {
			//console.log(data);
			if (data.indexOf("Already up-to-date") > -1) {
				console.log("Git reports up-to-date, doing nothing");
				console.log("(although NodeMC reports a newer version is available?)");
				return callback(true);
			}

			console.log("NodeMC updated, restart for new version.");
			return callback(false);
		});
	}
}
