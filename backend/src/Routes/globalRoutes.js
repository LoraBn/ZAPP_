const { Router } = require("express");
const { userSignIn } = require("../controllers/globalUser");
const { authenticateUser } = require("../middleware/userAuth");
const router = Router();

router.post("/signin", userSignIn);

router.get("/auth", authenticateUser, (req, res) => {
    res.status(200).json({ success: true });
  });

module.exports = router;
