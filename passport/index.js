const passport = require("passport");

const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const User = require("../models/user");

module.exports = () => {
  // 쿠키와 식별자를 매칭해서 저장하는 역할
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // serialize이후 요청마다 저장된 식별자로 유저의 정보를 찾아
  // req.user에 저장
  passport.deserializeUser((id, done) => {
    User.findOne({
      where: { id },
      include: [
        {
          model: User,
          attributes: ["id", "nick"],
          as: "Followers",
        },
        {
          model: User,
          attributes: ["id", "nick"],
          as: "Followings",
        },
      ],
    })
      .then((user) => {
        done(null, user);
      })
      .catch((err) => {
        done(err);
      });
  });

  local();
  kakao();
};
