const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { Post, Hashtag } = require("../models");
const { isLoggedIn } = require("../routes/middlewares");

const router = express.Router();

// 폴더가 있는지 확인하고 없으면 생성
try {
  fs.readdirSync("uploads");
} catch (err) {
  console.error("uploads 폴더가 없어 폴더를 생성합니다.");
  fs.mkdirSync("uploads");
}

const findHashtagArray = (postString) => {
  const hashtags = postString.match(/#[^\s#]*/g);
  if (hashtags) {
    const newHashtags = new Set(hashtags); // set객체로 중복 삭제
    const arrayHashtags = [];
    newHashtags.forEach((tag) => {
      arrayHashtags.push(tag);
    });
    return arrayHashtags;
  }
  return null;
};

const upload = multer({
  // 파일 저장 위치
  storage: multer.diskStorage({
    // multer.diskStorage = 파일은 디스크에 저장하기 위한 제어기능 제공
    // destination은 어느 폴더안에 업로드 한 파일을 저장할 지를 결정합니다
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      // 확장자
      const ext = path.extname(file.originalname);
      // 확장자 제거 후, 날짜 + 확장자 이름으로 저장
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 1024 * 1024 * 5 }, // 기본단위 bytes
});

// single: 폼데이터의 속성명이 img이거나 폼 태그 인풋의 name이 img인 파일 하나를 받
router.post("/img", isLoggedIn, upload.single("img"), (req, res) => {
  // upload로 받은 파일들이 req.file에 들어감.
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });
});

const upload2 = multer();

router.post("/", isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });
    // 여기에 해쉬태그 찾아서 등록
    const hashtagsArray = findHashtagArray(req.body.content);
    if (hashtagsArray) {
      /* 
        findOrCreate를 사용해서 나온 결과물은
        [
          [값(value), 중복여부(bool)],
          [값(value), 중복여부(bool)],
          [값(value), 중복여부(bool)],
        ]
        이런식으로 나와서 밑에서 map으로 앞에 있는 값만 넣어주는거임.
      */
      const result = await Promise.all(
        hashtagsArray.map((tag) => {
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          });
        })
      );
      await post.addHashtags(result.map((r) => r[0]));
    }
    res.redirect("/");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.delete("/:id/delete", async (req, res, next) => {
  const postId = req.params.id;
  try {
    // const findPost = await Post.findOne({
    //   where: { id: postId },
    //   attributes: ["id", "content"],
    // });
    // if (findPost) {
    //   // 해시태그 배열로 만들기
    //   const hashtagsArr = findHashtagArray(findPost.content);
    //   // 해시배열로 해시태그 찾기(id만)
    //   const findHashtags = await Promise.all(
    //     hashtagsArr.map((tag) => {
    //       return Hashtag.findOne({
    //         where: { title: tag.slice(1).toLowerCase() },
    //         attributes: ["id"],
    //       });
    //     })
    //   );
    //   // 찾은 해시태그 id와 유저 id로 조건이 맞는 열(row) 삭제
    //   await findPost.removeHashtags(
    //     findHashtags.map((tag) => {
    //       return tag.id;
    //     })
    //   );
    // 끝나고 게시글 삭제
    await Post.destroy({
      where: {
        id: postId,
        UserId: req.user.id,
      },
    });
    res.send("ok");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
