/**
 * Load and construct plugins.
 *
 * @author Mathew Da Costa <mathew678@hotmail.co.uk>
 * @license GPL-3.0
 */

"use strict";

const semver = require("semver"),
    path = require("path"),
    fs = require("fs-promise"),
    vm = require("vm2");

module.exports = class PluginLoader {

    /**
     * Plugin loader
     *
     * @param {Object} logger The logger instance
     * @param {Object} api The plugin API instance
     */
    constructor(logger, api) {
        this.logger = logger;
        this.api = api;
        this.config = require("../../config/config.js");
        this.plugins = {};

        this.vm = new vm.NodeVM({
            require: {
                external: true,
                builtin: ["dns", "fs", "path", "util"],
                root: "../.."
            }
        });
        this.vm.protect(api, "nmc");

        this.loadAll().then(() => {
            this.api.setMaxListeners(Object.keys(this.plugins).length * 2)
            this.executeAll();
        });
    }

    /**
     * Load the plugin at a given directory.
     * Does not check whether the plugin is valid.
     *
     * @param {string} pluginPath The path of the plugin to load.
     * @returns {undefined}
     */
    loadPlugin(pluginPath) {
        let pluginJson;
        try {
            pluginJson = require(path.join(pluginPath, "plugin.json"));
        } catch (e) {
            if (e.code == "MODULE_NOT_FOUND") return;
            throw e;
        }

        if (!semver.satisfies(this.config.nodemc.version.plugin, pluginJson.target)) {
            this.log(`${pluginJson.name} is not compatible with this version of NodeMC. The plugin targets ${pluginJson.target} but the plugin API version is ${this.config.nodemc.version.plugin}`);
            return;
        }

        let plugin = {};

        plugin.name = pluginJson.name;
        plugin.id = pluginJson.id;
        plugin.version = plugin.version;
        plugin.original = pluginJson;
        plugin.entryPoint = path.join(pluginPath, pluginJson.entryPoint);

        this.plugins[pluginJson.id] = plugin;
    }

    /**
     * Execute the plugin with the given plugin ID.
     *
     * @async
     * @param {string} pluginId The ID of the plugin to execute.
     * @returns {undefined}
     */
    async executePlugin(pluginId) {
        let plugin = this.plugins[pluginId];

        let js = await fs.readFile(plugin.entryPoint, "utf-8");

        let script = new vm.VMScript(js, plugin.entryPoint);
        this.vm.run(script, plugin.entryPoint);
    }
    
    /**
     * Load all plugins in a directory. This does not execute plugins.
     * 
     * @async
     * @param {string} [dir="plugins/"] The directory to load plugins from.
     * @returns {undefined}
     */
    async loadAll(dir = "plugins/") {
        let pluginsDir = path.resolve(__dirname, "../..", dir);
        let modules = await fs.readdir(pluginsDir);
        for (let pluginModule in modules) {
            if ({}.hasOwnProperty.call(modules, pluginModule)) {
                this.loadPlugin(path.join(pluginsDir, modules[pluginModule]));
            }
        }
    }

    /**
     * Executes all loaded plugins in the plugin VM.
     * @async
     * @returns {undefined}
     */
    async executeAll() {
        for (let pluginId in this.plugins) {
            if ({}.hasOwnProperty.call(this.plugins, pluginId)) {
                try {
                    await this.executePlugin(pluginId);
                } catch (err) {
                    console.log(err);
                }
            }
        }
    }
}
