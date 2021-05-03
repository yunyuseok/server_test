const request = require("supertest");
const { sequelize } = require("../models");
const app = require("../app");

beforeAll(async () => {
  await sequelize.sync();
});

describe("POST /join", () => {
  test("로그인 안했으면 가입", (done) => {
    request(app)
      .post("/auth/join")
      .send({
        email: "sayarn960@gmail.com",
        nick: "yuseok",
        password: "123",
      })
      .expect("Location", "/")
      .expect(302, done);
  });
});

describe("POST /login", () => {
  const agent = request.agent(app);
  beforeEach((done) => {
    agent
      .post("/auth/login")
      .send({
        email: "sayarn960@gmail.com",
        password: "123",
      })
      .end(done);
  });

  test("이미 로그인했으면 redirect /", (done) => {
    const message = encodeURIComponent("로그인한 상태입니다.");
    agent
      .post("/auth/join")
      .send({
        email: "sayan960@gmail.com",
        nick: "yuseok",
        password: "123",
      })
      .expect("Location", `/?error=${message}`)
      .expect(302, done);
  });
});

describe("POST /login", () => {
  test("가입되지 않은 회원", async (done) => {
    const message = encodeURIComponent("가입되지 않는 아이디입니다.");
    request(app)
      .post("/auth/login")
      .send({
        email: "sayan9601@gmail.com",
        password: "123",
      })
      .expect("Location", `/?loginError?=${message}`)
      .expect(302, done);
  });

  test("로그인 수행", async (done) => {
    request(app)
      .post(`/auth/login`)
      .send({
        email: "sayarn960@gmail.com",
        password: "123",
      })
      .expect("Location", "/")
      .expect(302, done);
  });

  test("비밀번호 틀림", async (done) => {
    const message = encodeURIComponent("비밀번호가 일치하지 않습니다.");
    request(app)
      .post("/auth/login")
      .send({
        email: "sayarn960@gmail.com",
        password: "12345",
      })
      .expect("Location", `/?loginError?=${message}`)
      .expect(302, done);
  });
});

describe("GET /logout", () => {
  test("로그인 되어있지 않으면 403", async (done) => {
    request(app).get("/auth/logout").expect(403, done);
  });

  // 에이전트를 만들면 그 상태가 계속 유지된다.
  const agent = request.agent(app);
  // beforeEach : 테스트하기 직전에 실행됨.
  // 테스트가 여러개면 그 여러개 전부다 실행되기 전에
  // beforeEach가 실행됨.
  // beforeEach는 describe의 각 범위 안에서만 적용된다.
  beforeEach((done) => {
    agent
      .post("/auth/login")
      .send({
        email: "sayarn960@gmail.com",
        password: "123",
      })
      .end(done);
  });

  test("로그아웃 수행", async (done) => {
    agent.get("/auth/logout").expect("Location", "/").expect(302, done);
  });
});

// db초기화
afterAll(async () => {
  await sequelize.sync({ force: true });
});
