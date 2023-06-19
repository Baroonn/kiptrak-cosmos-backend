const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const dotenv = require("dotenv").config();
const { validateToken } = require("./helpersV2")
const uploader = require("./multer");

const app = express();
const options = require('./swagger');

const port = process.env.PORT || 80;

app.use(express.json());

app.use("/api/v1/auth", require("./routes/authRoutes"));
//app.use(validateToken);
app.use("/api/v1/assignments",validateToken, require("./routes/assignmentRoutes"));
app.use('/api/v1/:id/imageupload', validateToken, uploader.array("file"), require("./routes/imageUploadRoutes"));
app.use('/api/v1/users', validateToken, require("./routes/userRoutes"));
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})