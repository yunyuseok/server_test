const { isLoggedIn, isNotLoggedIn } = require("./middlewares");

describe("isLoggedIn", () => {
  // 이렇게 가짜로 만드는게 모킹(mocking)이라고 함.

  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
  };
  const next = jest.fn();
  test("로그인 되어 있으면 isLoggedIn이 next호출", () => {
    const req = {
      isAuthenticated: jest.fn(() => true),
    };
    isLoggedIn(req, res, next);
    expect(next).toBeCalledTimes(1);
  });

  test("로그인 되어 있지않으면 isLoggedIn이 에러로 응답", () => {
    const req = {
      isAuthenticated: jest.fn(() => false),
    };
    isLoggedIn(req, res, next);
    expect(res.status).toBeCalledWith(403);
    expect(res.send).toBeCalledWith("로그인 필요");
  });
});

describe("isNotLoggedIn", () => {
  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
    redirect: jest.fn(),
  };
  const next = jest.fn();
  test("로그인 되어 있으면 isNotLoggedIn이 에러로 응답", () => {
    const req = {
      isAuthenticated: jest.fn(() => true),
    };
    const message = encodeURIComponent("로그인한 상태입니다.");
    isNotLoggedIn(req, res, next);
    expect(res.redirect).toBeCalledWith(`/?error=${message}`);
  });

  test("로그인 되어 있지 않으면 isNotLoggedIn이 next호출", () => {
    const req = {
      isAuthenticated: jest.fn(() => false),
    };
    isNotLoggedIn(req, res, next);
    expect(next).toBeCalledTimes(1);
  });
});
