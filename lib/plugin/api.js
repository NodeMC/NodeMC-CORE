/**
 * API which allows plugins to interact with NodeMC.
 *
 * @author Mathew Da Costa <mathew678@hotmail.co.uk>
 * @license GPL-3.0
 */

"use strict";

const Logger = require("../logger.js");
const EventEmitter = require("events");

const interfaces = {};

let api;

/**
 * The NodeMC Plugin API.
 * 
 * @class PluginAPI
 * @extends {EventEmitter}
 */
class PluginAPI extends EventEmitter {
    /**
     * Creates an instance of PluginAPI.
     *
     * @param {object} logger - The logger
     */
    constructor(logger) {
        super();
        this.logger = logger;
        api = this;
    }

    /**
     * Create a new Logger for the plugin.
     *
     * @param {string} name The name to use in the prefix of the logger
     *
     * @return {Object} A Logger (from lib/logger.js)
     */
    getLogger(name) {
        return new Logger(name);
    }

    /**
     * Gets an interface, if registered.
     * 
     * @param {string} name The name of the interface to get.
     * @returns {Interface} The requested interface.
     */
    getInterface(name) {
        return interfaces.hasOwnProperty(name) ? interfaces[name] : null;
    }
    
    /**
     * Register an interface for a plugin.
     *
     * @param {PluginInterface} pInterface The interface to register. Must be a plugin interface.
     * @returns {boolean} Whether the interface could be registered.
     */
    registerInterface(pInterface) {
        return pInterface instanceof PluginInterface ? registerInterface(pInterface) : false;
    }

    newPluginInterface(name, pluginId) {
        return new PluginInterface(name, pluginId);
    }
}

/**
 * Register a plugin or component interface.
 * 
 * @param {Interface} _interface The interface to register.
 * @returns {boolean} Whether the interface could be registered.
 */
function registerInterface(_interface) {
    let name = `${_interface.provider}.${_interface.name}`;
    if (_interface instanceof Interface && !interfaces.hasOwnProperty(name)) {
        interfaces[name] = _interface;
        _interface.emit("registered");
        api.emit("interfaceRegistered", name);
        return true;
    }
    return false;
}

/**
 * A generic API interface.
 * 
 * @class Interface
 * @extends {EventEmitter}
 */
class Interface extends EventEmitter {

    /**
     * Creates an instance of the interface..
     * @param {string} name The name of the interface. Must be provider-unique.
     * @param {string} provider The name of the provider (plugin or component).
     */
    constructor(name, provider) {
        super();
        this.name = name;
        this.provider = provider;
    }
}

/**
 * An API interface for NodeMC components.
 * 
 * @class ComponentInterface
 * @extends {Interface}
 */
class ComponentInterface extends Interface {
    /**
     * Creates an instance of the component interface.
     * @param {string} name The name of the interface. Must be component-unique.
     * @param {any} component The name of the component providing the interface.
     */
    constructor(name, component) {
        super(name, component);
        this.component = component;
    }
}

/**
 * An API interface for NodeMC plugins.
 * 
 * @class PluginInterface
 * @extends {Interface}
 */
class PluginInterface extends Interface {
    /**
     * Creates an instance of the component interface.
     * @param {string} name The name of the interface. Must be plugin-unique.
     * @param {any} pluginId The id of the plugin providing the interface.
     */
    constructor(name, pluginId) {
        super(name, pluginId);
        this.pluginId = pluginId;
    }
}

module.exports = {
    PluginAPI,
    ComponentInterface,
    PluginInterface,
    registerInterface
}
