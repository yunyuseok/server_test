const { addFollowing } = require("./user");
jest.mock("../models/user");
const User = require("../models/user");

describe("addFollowing", () => {
  const req = {
    user: { id: 1 },
    params: { id: 2 },
  };
  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
  };
  const next = jest.fn();
  test("사용자를 찾아 팔로잉을 추가하고 success를 응답해야 함.", async () => {
    User.findOne.mockReturnValue(
      Promise.resolve({
        addFollowings(value) {
          return Promise.resolve(true);
        },
      })
    );
    await addFollowing(req, res, next);
    expect(res.send).toBeCalledWith("success");
  });
  test("사용자가 없어 404에러와 메시지를 내야함.", async () => {
    User.findOne.mockReturnValue(Promise.resolve(null));
    await addFollowing(req, res, next);
    expect(res.status).toBeCalledWith(404);
    expect(res.send).toBeCalledWith("No find user");
  });
  test("사용자 찾기에 에러가 발생함.", async () => {
    const err = "테스트용 에러";
    User.findOne.mockReturnValue(Promise.reject(err));
    await addFollowing(req, res, next);
    expect(next).toBeCalledWith(err);
  });
});
