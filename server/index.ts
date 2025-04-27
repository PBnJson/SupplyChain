import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import mongoose from "mongoose";

// import { robotsRoute } from "./routes/robots";
// import { authRoute } from "./routes/auth";

import dotenv from "dotenv";
dotenv.config(); // Load .env variables

const app = new Hono();

const clientOptions: any = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI!, clientOptions);

    const mongooseInstance = await mongoose.connect(
      process.env.MONGO_URI!,
      clientOptions
    );
    const db = mongooseInstance.connection.db;

    if (!db) {
      console.error(
        "❌ db is undefined! readyState =",
        mongoose.connection.readyState
      );
      return;
    }
    await db.admin().command({ ping: 1 });
    console.log("✅ MongoDB Connected & Ping successful");
  } catch (err) {
    console.error("❌ MongoDB Connection Test Failed:", err);
    process.exit(1);
  }
}

connectToDB().catch((err) => {
  console.error(err);
  process.exit(1);
});

// Global Middleware
app.use("*", logger()); // Log all requests
app.use("*", cors()); // Enable CORS
app.use("*", secureHeaders()); // Set secure HTTP headers

// Routes
// app.route("/robots", robotsRoute);
// app.route("/auth", authRoute);

// Root Route
app.get("/", (c) => c.text("Welcome to the Game API Server 🚀"));

// Start Server
const port = Number(process.env.PORT) || 8080;

serve({
  fetch: app.fetch,
  port,
});

console.log(`🔥 Server running at http://localhost:${port}`);
