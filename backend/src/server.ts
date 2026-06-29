import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.js";
import readingsRouter from "./routes/readings.js";
import chatbotRouter from "./routes/chatbot.js";
import reportsRouter from "./routes/reports.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: "*", // Adjust origins in production
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Enable JSON Body Parser with increased limit for Base64 image payloads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[HTTP Request] ${req.method} ${req.url}`);
  next();
});

// Register Api Routes
app.use("/api/auth", authRouter);
app.use("/api/readings", readingsRouter);
app.use("/api/chatbot", chatbotRouter);
app.use("/api/reports", reportsRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "DiabeGuide API server is running" });
});

// Start Server and Database Connection
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`DiabeGuide API server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`=============================================`);
  });
};

startServer().catch(err => {
  console.error("Failed to start DiabeGuide API server:", err);
});
