const mongoose = require("mongoose");
const dns = require("node:dns");

// Use Google & Cloudflare DNS
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("❌ MONGODB_URI is not defined in the .env file");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:");
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;