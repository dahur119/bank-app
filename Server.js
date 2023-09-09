const http = require("http");
const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const PORT = 5000;
// const MONGO_URL = process.env.MONGO_URL;

const server = http.createServer(app);

const MONGO_URL =
  "mongodb+srv://bankapp:lM1LSGUVghBJSebE@cluster0.pmeu7jj.mongodb.net/?retryWrites=true&w=majority";

mongoose.connection.once("open", () => {
  console.log("MongoDb connection is ready");
});

mongoose.connection.on("error", (err) => {
  console.error(err);
});

async function startServer() {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    server.listen(PORT, () => {
      console.log(`Listening at port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

startServer();
