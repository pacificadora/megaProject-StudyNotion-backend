const mongoose = require("mongoose");

const courseProgressSchema = mongoose.model({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CourseModel",
  },
  completedVideos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSectionModel",
    },
  ],
});
//it should have the User ref as well. Course progress model has ref in userModel hence vice versa should also be there

module.exports = mongoose.model("CourseProgressModel", courseProgressSchema);
