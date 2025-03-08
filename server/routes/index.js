import express from "express";
import userRoutes from './users.js';
import taskRoutes from './tasks.js';
import projectRoutes from './project.js';
import messageRoutes from './messages.js';
import notificationRoutes from './notifications.js';
import categoryRoutes from './categories.js';
import labelRoutes from './labels.js';
import calendarRoutes from './calendar.js';
import analyticsRoutes from './analytics.js';
import dashboardRoutes from './dashboard.js';

const router = express.Router();

/* GET home page. */
router.get("/", (req, res) => {
  res.render("index", {
    title: "Test MongoDB",
    details:
      "To test, send a POST request with Postman to http://localhost:3000/users.",
    author: "@Premprakash8080",
  });
});

router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/projects', projectRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/categories', categoryRoutes);
router.use('/labels', labelRoutes);
router.use('/calendar', calendarRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;