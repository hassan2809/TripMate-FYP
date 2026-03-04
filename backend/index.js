const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const routes = require("./routes");
const http = require("http");
const { Server } = require('socket.io')
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);


// Load environment variables
dotenv.config();

// Import configurations
const appConfig = require("./config/app.config");
const connectDB = require("./config/db.config");
const configureSocket = require("./Socket");

// Initialize Express app
const app = express();
const server = http.createServer(app); 

const io = new Server(server, { cors: "*" }); 
configureSocket(io); 

// Connect to database
connectDB();

// Middleware
app.use("/api/v1/stripe", require("./routes/v1/stripeWebhook.route"));
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());

// Static file handling
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/v1", routes);

app.get("*", (req, res, next) => {
  if (req.originalUrl.startsWith("/socket.io")) return next();
});

const port = appConfig.app.port || 8000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
