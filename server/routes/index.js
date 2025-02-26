import express from "express";

const router = express.Router();

/* GET home page. */
router.get("/", (req, res) => {
  res.render("index", {
    title: "Test MongoDB",
    details:
      "To test, send a POST request with Postman to http://localhost:3000/users.",
    author: "@mreorhan",
  });
});

export default router;