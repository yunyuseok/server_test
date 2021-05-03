const express = require("express");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const { User, Post, Hashtag } = require("../models");

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followingCount = req.user ? req.user.Followings.length : 0;
  res.locals.followerCount = req.user ? req.user.Followers.length : 0;
  res.locals.followerIdList = req.user
    ? req.user.Followings.map((f) => f.id)
    : [];
  next();
});

// 프로필 창
router.get("/profile", isLoggedIn, (req, res) => {
  res.render("profile", {
    title: "NodeBird - profile",
  });
});

// 회원가입 창
router.get("/join", isNotLoggedIn, (req, res) => {
  res.render("join", {
    title: "NodeBird - join",
  });
});

//해쉬태그 검색
router.get("/hashtag", async (req, res, next) => {
  const query = req.query.hashtag;
  if (!query) {
    return res.redirect("/");
  }
  try {
    const hashtag = await Hashtag.findOne({
      where: { title: query },
    });
    let posts = [];
    if (hashtag) {
      // 해시태그에 해당하는 글과 유저정보 가져옴
      posts = await hashtag.getPosts({
        include: [
          {
            model: User,
            attributes: ["id", "nick"],
          },
        ],
      });
    }
    res.render("main", {
      title: "검색결과 | NodeBird",
      twits: posts,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 매인 창
router.get("/", async (req, res, next) => {
  try {
    // 게시글 받아오기
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ["id", "nick"],
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("main", {
      title: "NodeBird - main",
      twits: posts,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
