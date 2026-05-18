//1.Dependencies
const express = require("express");
const expressSession = require("express-session");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const MongoStore = require("connect-mongo").default;

const Registration = require("./models/Registration");

require("dotenv").config();
const connectDb = require("./config/db");

//2.Instantiations
const app = express();
const port = 3000;

//3.Configurations
connectDb();
//Set templating engine to pug
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// 4.Middleware
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));

// Express session configurations
app.use(
  expressSession({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE,
      collectionName: "sessionStorage",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 2, //2 hours life for a login session
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// Passport configurations
passport.use(Registration.createStrategy());
passport.serializeUser(Registration.serializeUser());
passport.deserializeUser(Registration.deserializeUser());

// * Global variable to make the logged in user available to all pug templates
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});
//5.Routes
app.use("/", require("./routes/signRoutes"));
app.use("/", require("./routes/stockRoutes"));
app.use("/", require("./routes/salesRoutes"));
app.use("/", require("./routes/depositsRoutes"));
app.use("/", require("./routes/dashboardRoutes"));

// This is the second last chunk of code
// Handling non-existent route
app.use((req, res) => {
  res.status(404).send("oops!Route not found.");
});

//6.Bootstrapping Server
// This must be the last line of code in this file!
app.listen(port, () => console.log(`listening on port ${port}`)); // new
