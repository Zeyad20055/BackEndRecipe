const express = require("express");
const dotenv = require("dotenv").config();
const app = express();

const connectDB = require("./Config/connectionDB");
connectDB();
const PORT = process.env.PORT || 3000;
const cors = require("cors");
app.use(cors());

app.use(express.json());
app.use("/recipe", require("./Routes/recipe.route"));
app.use("/user", require("./Routes/User.route"))
app.use("/public", express.static("Public"));
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
