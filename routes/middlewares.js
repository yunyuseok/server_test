module.exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    // 로그인이 되어있다.
    next(); // 다음으로 넘김
  } else {
    res.status(403).send("로그인 필요");
  }
};

module.exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // 로그아웃 되어있다.
    next(); // 다음으로 넘김
  } else {
    const message = encodeURIComponent("로그인한 상태입니다.");
    res.redirect(`/?error=${message}`);
  }
};
