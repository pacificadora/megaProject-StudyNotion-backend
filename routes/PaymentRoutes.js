// Import the required modules
const express = require("express");
const router = express.Router();

const {
  capturePayment,
  verifyPayment,
} = require("../controllers/PaymentController");
const {
  auth,
  isInstructor,
  isStudent,
  admin,
} = require("../middlewares/authMiddleware");
router.post("/capturePayment", auth, isStudent, capturePayment);
router.post("/verifySignature", verifyPayment);

module.exports = router;
