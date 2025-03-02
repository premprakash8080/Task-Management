import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import createError from "http-errors";
import { fileURLToPath } from "url";
import { dirname } from "path";

import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import tasksRouter from "./routes/tasks.js";
import projectsRouter from "./routes/project.js";
import messagesRouter from "./routes/messages.js";
import notificationsRouter from "./routes/notifications.js";
import labelsRouter from "./routes/labels.js";
import categoriesRouter from "./routes/categories.js";
import db from "./helper/db.js";

// Initialize database
db();

const app = express();

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Enable CORS for requests from http://localhost:3000
app.use(cors({
  origin: "http://localhost:3000"
}));

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/labels", labelsRouter);
app.use("/api/categories", categoriesRouter);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message,
    error: req.app.get("env") === "development" ? err : {}
  });
});

export default app;