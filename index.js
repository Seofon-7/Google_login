const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const authRoute = require("./routes/auth-route");
const profileRoute = require("./routes/profile-route");
require("./config/passport");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");

mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("連線到芒果Atlas");
  })
  .catch((err) => {
    console.log(err);
  });

// middleware，這邊採用的順序要注意，先設定session後再設定passport的session
// 再設定flash最後才設定route
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// 用來瀏覽器儲存cookies
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// res.locals是一個物件,success_msg是他的property
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});
//Node.js的server接收到request時會經過middleware，會去檢查說
//這些middleware中有沒有/auth，有的話就會進入authRoute，進入後就可以檢查是要做login還是怎樣
app.use("/auth", authRoute);
app.use("/profile", profileRoute);

app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
