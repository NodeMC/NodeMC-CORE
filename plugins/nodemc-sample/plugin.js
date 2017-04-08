// Logging

const logger = nmc.getLogger("SamplePlugin");

logger.log("SamplePlugin has been executed!");

// Exposing an interface

let sampleInterface = nmc.newPluginInterface("sample", "nodemc-sample"); // Create a new plugin interface.

sampleInterface.on("hello", (message) => { // You can also receive data from other plugins with events.
    logger.log(`Hello ${message}!`);
});

sampleInterface.on("registered", () => { // Other plugins can use the interface once this has been fired.
    logger.log("Yay, we got registered!")
})

nmc.registerInterface(sampleInterface); // Make sure to register the interface!

// Using other interfaces

let testInterface = nmc.getInterface("nodemc-elpmas.elpmas"); // You can retrieve other plugins' interfaces.
testInterface ? testInterface.emit("hello", "from SamplePlugin - you ran before me") // Test whether it has been registered yet.
    : nmc.on("interfaceRegistered", (name) => { // If not, listen for when it has been.
        if (name == "nodemc-elpmas.elpmas") {
            testInterface = nmc.getInterface("nodemc-elpmas.elpmas");
            testInterface.emit("hello", "from SamplePlugin - you ran after I did");
        }
    });
