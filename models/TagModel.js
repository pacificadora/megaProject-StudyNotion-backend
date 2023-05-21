const mongoose = require("mongoose");

const tagSchema = new mongoose.model({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
});

module.exports = mongoose.model("TagModel", tagSchema);
