const mongoose = require("mongoose");
const dns = require("node:dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  try {
    console.log("Node Version:", process.version);
    console.log("Mongo URI:", process.env.MONGODB_URI?.replace(/\/\/.*:.*@/, "//<user>:<password>@"));

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.log("============== ERROR ==============");
    console.dir(err, { depth: null });
    console.log("Error name:", err.name);
    console.log("Error message:", err.message);
    console.log("Error cause:", err.cause);
    console.log("===================================");
    process.exit(1);
  }
};

module.exports = connectDB;