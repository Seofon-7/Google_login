const router = require("express").Router();
const passport = require("passport");
const { deleteOne } = require("../models/user-model");
const User = require("../models/user-model");
const bcrypt = require("bcrypt");

router.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

router.get("/signup", (req, res) => {
  res.render("signup", { user: req.user });
});

router.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login",
    failureFlash: "信箱或密碼錯誤",
  }),
  //登入成功就導向profile頁面
  (req, res) => {
    if (req.session.returnTo) {
      let newPath = req.session.returnTo;
      req.session.returnTo = "";
      res.redirect(newPath);
    } else {
      res.redirect("/profile");
    }
  }
);

router.post("/signup", async (req, res) => {
  console.log(req.body);
  let { name, email, password } = req.body;
  // 假如資料已經在DB了
  const emailExist = await User.findOne({ email });
  if (emailExist) {
    req.flash("error_msg", "Email已經被註冊");
    res.redirect("/auth/signup");
  }

  // 幫資料加密
  const hash = await bcrypt.hash(password, 10);
  password = hash;
  let newUser = new User({ name, email, password });
  try {
    await newUser.save();
    req.flash("success_msg", "註冊成功");
    res.redirect("/auth/login");
  } catch (err) {
    req.flash("error_msg", err.errors.name.properties.message);
    res.redirect("/auth/signup");
  }
});

// 用passport來對google做驗證,驗證方式是從google驗證使用者後,取得這個使用者的profile
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// 若希望每次登入系統時可以選擇登入的帳號
// router.get(
//   "/google",
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//     prompt: "select_account",
//   })
// );

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  if (req.session.returnTo) {
    let newPath = req.session.returnTo;
    req.session.returnTo = "";
    res.redirect(newPath);
  } else {
    res.redirect("/profile");
  }
});

module.exports = router;
