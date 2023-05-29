const express = require("express");
const app = express();

const userRoutes = require("./routes/UserRoutes");
const courseRoutes = require("./routes/CourseRoutes");
const profileRoutes = require("./routes/ProfileRoutes");
const paymentRoutes = require("./routes/PaymentRoutes");

const database = require("./configs/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./configs/cloudinary");
const fileUploader = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();
const port = process.env.PORT || 4000;

//db connect
database.connect();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: `http://localhost:3000`,
    credentials: true,
  })
);
app.use(
  fileUploader({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

cloudinaryConnect();

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/payment", paymentRoutes);

app.use("/", (req, res) => {
  return res.statusCode(200).json({
    success: true,
    message: "Your server is up and running...",
  });
});

app.listen(port, () => {
  console.log(`app is running at port ${port}`);
});
