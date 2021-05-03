const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const User = require("../models/user");

module.exports = () => {
  passport.use(
    new localStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const exUser = await User.findOne({ where: { email } });
          if (exUser) {
            const result = await bcrypt.compare(
              password /* 유저가 입력한 비밀번호 */,
              exUser.password /* 유저의 해시값 */
            );
            if (result) {
              done(null, exUser);
            } else {
              done(null, false, { message: "비밀번호가 일치하지 않습니다." });
            }
          } else {
            done(null, false, { message: "가입되지 않는 아이디입니다." });
          }
        } catch (err) {
          console.error(err);
          done(error);
        }
      }
    )
  );
};
