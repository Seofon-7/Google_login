const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/user-model");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

passport.serializeUser((user, done) => {
  console.log("Serializing user now");
  done(null, user._id); //不管是哪種方式註冊的,都會存到DB中,每筆資料都會做出一個id,然後每個id前面有個底線
});

passport.deserializeUser((_id, done) => {
  console.log("Deserializing user now");
  User.findById({ _id }).then((user) => {
    console.log("Found User.");
    done(null, user);
  });
});

passport.use(
  new LocalStrategy((username, password, done) => {
    console.log(username, password);
    // 確認是否有這個user
    User.findOne({ email: username })
      .then(async (user) => {
        if (!user) {
          // 不認證使用者
          return done(null, false);
        }
        //使用者存在，確認密碼和資料庫的密碼是否一樣
        await bcrypt.compare(password, user.password, function (err, result) {
          if (err) {
            return done(null, false);
          }
          if (!result) {
            return done(null, false);
          } else {
            return done(null, user);
          }
        });
      })
      .catch((err) => {
        return done(null, false);
      });
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
    },
    (accessToken, refreshToken, profile, done) => {
      // passport callback
      console.log(profile);
      User.findOne({ googleID: profile.id }).then((foundUser) => {
        if (foundUser) {
          console.log("User already exist");
          done(null, foundUser);
        } else {
          new User({
            // 從profile中可以看到要的資料在哪還有他是哪種類別，
            // 像是email和大頭貼都是要他array中的第一個資料
            name: profile.displayName,
            googleID: profile.id,
            thumbnail: profile.photos[0].value,
            email: profile.emails[0].value,
          })
            .save()
            .then((newUser) => {
              console.log("New User created.");
              done(null, newUser);
            });
        }
      });
    }
  )
);
