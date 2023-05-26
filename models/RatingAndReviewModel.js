const mongoose = require("mongoose");

const ratingAndReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  review: {
    type: String,
  },
  rating: {
    type: Number,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Course",
    index: true,
  },
});

module.exports = mongoose.model("ratingAndReviewModel", ratingAndReviewSchema);
