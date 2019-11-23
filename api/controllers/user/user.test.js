"use strict";
const expect = require("chai").expect;
const request = require("supertest");
const app = require("../../../app");

let admin = {}; // Save token key after login
let normalUser = {};
let listUsers = []; // Use to update, delete this userId

describe("POST /users", () => {
  it("OK, create new user with email dung.van@gmail.com", done => {
    request(app)
      .post("/users")
      .send({
        name: "Nguyen Van Dung",
        email: "dung.van@gmail.com",
        password: "12345678a"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("user");
        expect(body.user.name).to.equals("Nguyen Van Dung");
        expect(body.user.email).to.equals("dung.van@gmail.com");
        done();
      })
      .catch(error => done(error));
  });
  it("OK, create new user with email kien.tran@hot.com", done => {
    request(app)
      .post("/users")
      .send({
        name: "Luck",
        email: "luck@hot.com",
        password: "12345678b"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("user");
        expect(body.user.name).to.equals("Luck");
        expect(body.user.email).to.equals("luck@hot.com");
        done();
      })
      .catch(error => done(error));
  });
  it("OK, create new user with email smith@exo.com", done => {
    request(app)
      .post("/users")
      .send({
        name: "Smith",
        email: "smith@exo.com",
        password: "12345678c"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("user");
        expect(body.user.name).to.equals("Smith");
        expect(body.user.email).to.equals("smith@exo.com");
        done();
      })
      .catch(error => done(error));
  });
  it("OK, create new user with email tuan.nv@amavi.asia", done => {
    request(app)
      .post("/users")
      .send({
        name: "Nguyen Van Tuan",
        email: "tuan.nv@amavi.asia",
        password: "12345678c"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("user");
        expect(body.user.name).to.equals("Nguyen Van Tuan");
        expect(body.user.email).to.equals("tuan.nv@amavi.asia");
        done();
      })
      .catch(error => done(error));
  });
  it("OK, create new user with email kien.nguyen@amavi.asia", done => {
    request(app)
      .post("/users")
      .send({
        name: "Nguyen Kien",
        email: "kien.nguyen@amavi.asia",
        password: "12345678c"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("user");
        expect(body.user.name).to.equals("Nguyen Kien");
        expect(body.user.email).to.equals("kien.nguyen@amavi.asia");
        done();
      })
      .catch(error => done(error));
  });
  it("OK, create new user with email phu.tran@amavi.asia", done => {
    request(app)
      .post("/users")
      .send({
        name: "Tran Phu",
        email: "phu.tran@amavi.asia",
        password: "12345678c"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("user");
        expect(body.user.name).to.equals("Tran Phu");
        expect(body.user.email).to.equals("phu.tran@amavi.asia");
        done();
      })
      .catch(error => done(error));
  });
  it("OK, create new user with email mai.huong@amavi.asia", done => {
    request(app)
      .post("/users")
      .send({
        name: "Huong Mai",
        email: "mai.huong@amavi.asia",
        password: "12345678c"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("user");
        expect(body.user.name).to.equals("Huong Mai");
        expect(body.user.email).to.equals("mai.huong@amavi.asia");
        done();
      })
      .catch(error => done(error));
  });
  it("OK, create new user with email ngocancsdl@gmail.com", done => {
    request(app)
      .post("/users")
      .send({
        name: "Lê Thị Ngọc An",
        email: "ngocancsdl@gmail.com",
        password: "12345678d"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("user");
        expect(body.user.name).to.equals("Lê Thị Ngọc An");
        expect(body.user.email).to.equals("ngocancsdl@gmail.com");
        done();
      })
      .catch(error => done(error));
  });

  it("FAIL, Password must be eight characters or longer, must contain at least 1 numeric character, 1 lowercase charater", done => {
    request(app)
      .post("/users")
      .send({
        name: "PWS Join",
        email: "pwdjoin@gmail.com",
        password: "1234567"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(400);
        expect(body).to.not.contain.property("user");
        done();
      })
      .catch(error => done(error));
  });
  it("FAIL, duplicate email", done => {
    request(app)
      .post("/users")
      .send({
        name: "Nguyen Van Dung",
        email: "dung.van@gmail.com",
        password: "12345678e"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(400);
        expect(body).to.contain.property("message");
        expect(body).to.not.contain.property("user");
        done();
      })
      .catch(error => done(error));
  });
  it("FAIL, wrong email format", done => {
    request(app)
      .post("/users")
      .send({
        name: "Taylor Swift",
        email: "taylorgmail.com",
        password: "12345678f"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(400);
        expect(body).to.contain.property("message");
        expect(body).to.not.contain.property("user");
        done();
      })
      .catch(error => done(error));
  });
  it("FAIL, missing email", done => {
    request(app)
      .post("/users")
      .send({
        name: "Taylor Swift",
        password: "12345678g"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(400);
        expect(body).to.contain.property("message");
        expect(body).to.not.contain.property("user");
        done();
      })
      .catch(error => done(error));
  });
  it("FAIL, missing password", done => {
    request(app)
      .post("/users")
      .send({
        name: "Taylor Swift",
        email: "taylorgmail.com"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(400);
        expect(body).to.contain.property("message");
        expect(body).to.not.contain.property("user");
        done();
      })
      .catch(error => done(error));
  });
});

describe("POST /users/admin", () => {
  it("OK, create admin with email vantuan130393@gmail.com", done => {
    request(app)
      .post("/users/admin")
      .send({
        name: "Nguyễn Văn Tuấn",
        email: "vantuan130393@gmail.com",
        password: "12345678a"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("user");
        expect(body.user.name).to.equals("Nguyễn Văn Tuấn");
        expect(body.user.email).to.equals("vantuan130393@gmail.com");
        done();
      })
      .catch(error => done(error));
  });
  it("FAIL, only create admin once time", done => {
    request(app)
      .post("/users/admin")
      .send({
        name: "Admin 2",
        email: "admin2@gmail.com",
        password: "12345678a"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(400);
        expect(body).to.contain.property("message");
        expect(body).to.not.contain.property("user");
        done();
      })
      .catch(error => done(error));
  });
});

describe("POST /auths/login", () => {
  it("Ok, login admin account", done => {
    request(app)
      .post(`/auths/login`)
      .send({
        email: "vantuan130393@gmail.com",
        password: "12345678a"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("user");
        expect(body.user).to.contain.property("tokenKey");
        admin = body.user;
        // Save token key to global variable and use it in other test
        done();
      })
      .catch(error => done(error));
  });
  it("Ok, login user account", done => {
    request(app)
      .post(`/auths/login`)
      .send({
        email: "tuan.nv@amavi.asia",
        password: "12345678c"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("user");
        expect(body.user).to.contain.property("tokenKey");
        normalUser = body.user;
        // Save token key to global variable and use it in other test
        done();
      })
      .catch(error => done(error));
  });
});

describe("GET /users", () => {
  it("OK, get list users", done => {
    request(app)
      .get("/users")
      .set({
        "x-access-token": admin.tokenKey
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("users");
        expect(body.users.length).to.equals(9);
        listUsers = body.users;
        done();
      })
      .catch(error => done(error));
  });
});

describe("GET /users/email/", () => {
  it("OK, find user by email", done => {
    request(app)
      .get("/users/email/smith@exo.com")
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("user");
        done();
      })
      .catch(error => done(error));
  });
});

describe("GET /users/:userId", () => {
  it("OK, get detail user", done => {
    request(app)
      .get(`/users/${listUsers[0]._id}?fields=name,email,password`)
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("user");
        expect(body.user).to.contain.property("name");
        expect(body.user).to.contain.property("email");
        expect(body.user).to.not.contain.property("password");
        expect(body.user).to.not.contain.property("address");
        done();
      })
      .catch(error => done(error));
  });
});

describe("POST /users/admin/:userIds/block", () => {
  it("OK, block user by admin", done => {
    request(app)
      .post(`/users/admin/${listUsers[0]._id}/block`)
      .set({
        "x-access-token": admin.tokenKey
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("raw");
        expect(body.raw.ok).to.greaterThan(0);
        done();
      })
      .catch(error => done(error));
  });
  it("FAIL, user not permistion", done => {
    request(app)
      .post(`/users/admin/${listUsers[1]._id}/block`)
      .set({
        "x-access-token": normalUser.tokenKey
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(403);
        expect(body).to.contain.property("message");
        done();
      })
      .catch(error => done(error));
  });
});

describe("POST /users/admin/:userIds/unlock", () => {
  it("OK, unlock user by admin", done => {
    request(app)
      .post(`/users/admin/${listUsers[0]._id}/unlock`)
      .set({
        "x-access-token": admin.tokenKey
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("raw");
        expect(body.raw.ok).to.greaterThan(0);
        done();
      })
      .catch(error => done(error));
  });
  it("FAIL, user not permistion", done => {
    request(app)
      .post(`/users/admin/${listUsers[1]._id}/unlock`)
      .set({
        "x-access-token": normalUser.tokenKey
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(403);
        expect(body).to.contain.property("message");
        done();
      })
      .catch(error => done(error));
  });
});

describe("PUT /users/:userId", () => {
  it("OK, update user by admin", done => {
    request(app)
      .put(`/users/${listUsers[0]._id}`)
      .set({
        "x-access-token": admin.tokenKey
      })
      .send({
        name: "Smith",
        gender: "male",
        phone: "0335578022",
        address: "Ho Chi Minh"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("user");
        expect(body.user.name).to.equals("Smith");
        expect(body.user.gender).to.equals("male");
        expect(body.user.phone).to.equals("0335578022");
        expect(body.user.address).to.equals("Ho Chi Minh");
        done();
      })
      .catch(error => done(error));
  });
  it("OK, update user with change password", done => {
    request(app)
      .put(`/users/${listUsers[0]._id}`)
      .set({
        "x-access-token": admin.tokenKey
      })
      .send({
        name: "Smith",
        gender: "male",
        phone: "0335578022",
        address: "Ho Chi Minh",
        password: "12345678new",
        oldPassword: "12345678a"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("user");
        expect(body.user.name).to.equals("Smith");
        expect(body.user.gender).to.equals("male");
        expect(body.user.phone).to.equals("0335578022");
        expect(body.user.address).to.equals("Ho Chi Minh");
        done();
      })
      .catch(error => done(error));
  });
  it("FAIL, update user wrong old password", done => {
    request(app)
      .put(`/users/${listUsers[0]._id}`)
      .set({
        "x-access-token": admin.tokenKey
      })
      .send({
        name: "Smith",
        gender: "male",
        phone: "0335578022",
        address: "Ho Chi Minh",
        password: "1234567ee",
        oldPassword: "12345678c"
      })
      .then(res => {
        expect(res.statusCode).to.equals(400);
        done();
      })
      .catch(error => done(error));
  });
  it("FAIL, user not permistion", done => {
    request(app)
      .put(`/users/${listUsers[0]._id}`)
      .set({
        "x-access-token": normalUser.tokenKey
      })
      .send({
        name: "Smith",
        gender: "male",
        phone: "0335578022",
        address: "Ho Chi Minh"
      })
      .then(res => {
        expect(res.statusCode).to.equals(403);
        done();
      })
      .catch(error => done(error));
  });
});

describe("DELETE /users/admin/:userIds/", () => {
  it("OK, delete user by admin", done => {
    request(app)
      .delete(`/users/admin/${listUsers[0]._id}/`)
      .set({
        "x-access-token": admin.tokenKey
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("raw");
        expect(body.raw.ok).to.greaterThan(0);
        done();
      })
      .catch(error => done(error));
  });
  it("FAIL, user not permistion", done => {
    request(app)
      .delete(`/users/admin/${listUsers[0]._id}/`)
      .set({
        "x-access-token": normalUser.tokenKey
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(403);
        done();
      })
      .catch(error => done(error));
  });
});

describe("POST /users/admin/:userId/change-user-role?role=admin", () => {
  it("OK, change user role to mod", done => {
    request(app)
      .post(`/users/admin/${normalUser._id}/change-user-role?role=mod`)
      .set({
        "x-access-token": admin.tokenKey
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("user");
        expect(body.user.role).to.equals("mod");
        done();
      })
      .catch(error => done(error));
  });
});
