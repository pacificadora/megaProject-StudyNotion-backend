const mongoose = require("mongoose");

const ratingAndReviewSchema = new mongoose.model({
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
});

module.exports = mongoose.model("ratingAndReviewModel", ratingAndReviewSchema);