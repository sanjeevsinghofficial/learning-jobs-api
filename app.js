require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

//security
const helmet = require("helmet");
const cors = require("cors");
const rateLimiter = require("express-rate-limit");
const xss = require("xss-clean");

//Swagger
const swaggerUI = require("swagger-ui-express");
const yamljs = require("yamljs");
const swaggerDocument = yamljs.load("./swagger.yaml");

//connectDB
const connectDB = require("./db/connect");

const authMiddleware = require("./middleware/authentication");

const authRouter = require("./routes/auth");
const jobsRouter = require("./routes/jobs");

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  }),
);
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "cdnjs.cloudflare.com",
          "fonts.googleapis.com",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "online.swagger.io",
          "validator.swagger.io",
        ],
      },
    },
  }));
app.use(xss());
app.use(express.json());
// extra packages

// routes
app.get("/", (req, res) => {
  res.send("<h1>Jobs API</h1><a href='/api-docs'>Documentation</a>");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authMiddleware, jobsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`),
    );
  } catch (error) {
    console.log(error);
  }
};

start();
