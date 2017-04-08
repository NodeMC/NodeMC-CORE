module.exports = {
    "minecraft": {
      "ram": "512M",
                "port": 25565,
                "dir": "./minecraft",
                "type": "vanilla",
                "jarfile": "vanilla-1.9.jar",
                "version": "1.9",
                "ip": "localhost"
            },
            "nodemc": { // this section is different to regular nodemc section
                "logDirectory": "./logs", // Directory for NodeMC log stream
                "managed": true, // if false, NodeMC won't attempt to configure MC
                "sockettype": "os", // Unix/Windows socket (os) or TLS (net)
                "location": "nmcls1", // ID of Unix/Windows Socket
                "port": 24565 // Port for TLS Socket
            }
}