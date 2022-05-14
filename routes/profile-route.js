const router = require("express").Router();
const Post = require("../models/post-model");

//做一個middleware用來確認是否認證
const authCheck = (req, res, next) => {
  // 先確認一下接收到哪些資料
  console.log(req.user);
  console.log(req.originalUrl);
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    res.redirect("/auth/login");
  } else {
    next();
  }
};

router.get("/", authCheck, async (req, res) => {
  let postFound = await Post.find({ autor: req.user._id });
  res.render("profile", { user: req.user, posts: postFound });
});

router.get("/post", authCheck, (req, res) => {
  res.render("post", { user: req.user });
});

router.post("/post", authCheck, async (req, res) => {
  let { title, content } = req.body;
  let newPost = new Post({ title, content, author: req.user._id });
  try {
    await newPost.save();
    res.status(200).redirect("/profile");
  } catch (err) {
    req.flash("error_msg", "標題和內容是必須的");
    res.redirect("/profile/post");
  }
});

module.exports = router;
