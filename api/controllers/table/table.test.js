"use strict";
const expect = require("chai").expect;
const request = require("supertest");
const app = require("../../../app");
const redis = require("../../helpers/redis");

let owner = {};
let kienMember = {};
let anMember = {};
let nonMember = {};
let listTables = []; // Use to update, delete this company with Id
let userIds = []; // Array user will add to table

describe("PREPARE TESTING TABLE", () => {
  it("OK, login user", done => {
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
        owner = body.user;
        done();
      })
      .catch(error => done(error));
  });
});

describe("POST /tables", () => {
  it("OK, create Table 1", done => {
    request(app)
      .post("/tables")
      .set({
        "x-access-token": owner.tokenKey
      })
      .send({
        title: "Table 1",
        description:
          "curae donec pharetra magna vestibulum aliquet ultrices erat tortor sollicitudin mi sit",
        isAllowMemberAddMember: 0
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("table");
        expect(body.table.title).to.equals("Table 1");
        expect(body.table.description).to.equals(
          "curae donec pharetra magna vestibulum aliquet ultrices erat tortor sollicitudin mi sit"
        );
        done();
      })
      .catch(error => done(error));
  });
  it("OK, create Table 2", done => {
    request(app)
      .post("/tables")
      .set({
        "x-access-token": owner.tokenKey
      })
      .send({
        title: "Table 2",
        description: "a libero nam dui proin leo odio porttitor id consequat"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("table");
        expect(body.table.title).to.equals("Table 2");
        expect(body.table.description).to.equals(
          "a libero nam dui proin leo odio porttitor id consequat"
        );
        done();
      })
      .catch(error => done(error));
  });
  it("OK, create Table 3", done => {
    request(app)
      .post("/tables")
      .set({
        "x-access-token": owner.tokenKey
      })
      .send({
        title: "Table 3",
        description:
          "ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae duis faucibus"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("table");
        expect(body.table.title).to.equals("Table 3");
        expect(body.table.description).to.equals(
          "ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae duis faucibus"
        );
        done();
      })
      .catch(error => done(error));
  });
  it("OK, create Table 4", done => {
    request(app)
      .post("/tables")
      .set({
        "x-access-token": owner.tokenKey
      })
      .send({
        title: "Table 4",
        description:
          "eget eleifend luctus ultricies eu nibh quisque id justo sit amet sapien dignissim"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("table");
        expect(body.table.title).to.equals("Table 4");
        expect(body.table.description).to.equals(
          "eget eleifend luctus ultricies eu nibh quisque id justo sit amet sapien dignissim"
        );
        done();
      })
      .catch(error => done(error));
  });
  it("OK, create Table 5", done => {
    request(app)
      .post("/tables")
      .set({
        "x-access-token": owner.tokenKey
      })
      .send({
        title: "Table 5",
        description:
          "vitae consectetuer eget rutrum at lorem integer tincidunt ante vel ipsum praesent blandit lacinia erat vestibulum sed magna at nunc"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("table");
        expect(body.table.title).to.equals("Table 5");
        expect(body.table.description).to.equals(
          "vitae consectetuer eget rutrum at lorem integer tincidunt ante vel ipsum praesent blandit lacinia erat vestibulum sed magna at nunc"
        );
        done();
      })
      .catch(error => done(error));
  });
  it("FAIL, missing title", done => {
    request(app)
      .post("/tables")
      .set({
        "x-access-token": owner.tokenKey
      })
      .send({
        description: "Table FAIL Description"
      })
      .then(res => {
        expect(res.statusCode).to.equals(400);
        done();
      })
      .catch(error => done(error));
  });
});

describe("GET /tables", () => {
  it("OK, Query list of tables", done => {
    request(app)
      .get("/tables?fields=title")
      .set({
        "x-access-token": owner.tokenKey
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("tables");
        expect(body.tables.length).to.equals(5);
        listTables = body.tables;
        redis.setex("listTables", 3600, JSON.stringify(listTables));
        done();
      })
      .catch(error => done(error));
  });
});

describe("GET /tables/:tableId", () => {
  it("OK, Get detail table", done => {
    request(app)
      .get(`/tables/${listTables[0]._id}`)
      .set({
        "x-access-token": owner.tokenKey
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("table");
        done();
      })
      .catch(error => done(error));
  });
});

describe("PREPARE ADD MEMBERS", () => {
  it("OK, get users will add to table", done => {
    request(app)
      .get("/users")
      .set({
        "x-access-token": owner.tokenKey
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        userIds = body.users.map(user => user._id).slice(0, 4);
        // Save to redis store to re-use
        redis.setex("userIds", 3600, JSON.stringify(userIds));
        done();
      })
      .catch(error => done(error));
  });
  it("OK, login member will add to table", done => {
    request(app)
      .post(`/auths/login`)
      .send({
        email: "ngocancsdl@gmail.com",
        password: "12345678d"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        anMember = body.user;
        done();
      })
      .catch(error => done(error));
  });
  it("OK, login non-member table to test permistion", done => {
    request(app)
      .post(`/auths/login`)
      .send({
        email: "mai.huong@amavi.asia",
        password: "12345678c"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        nonMember = body.user;
        done();
      })
      .catch(error => done(error));
  });
});

describe("POST /tables/:tableId/add-members", () => {
  it("OK, add list members to table", done => {
    request(app)
      .post(`/tables/${listTables[0]._id}/add-members`)
      .set({
        "x-access-token": owner.tokenKey
      })
      .send({
        userIds: userIds.slice(0, 4)
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        done();
      })
      .catch(error => done(error));
  });
  it("OK, add single member to table", done => {
    request(app)
      .post(`/tables/${listTables[0]._id}/add-members`)
      .set({
        "x-access-token": owner.tokenKey
      })
      .send({
        userIds: anMember._id
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        done();
      })
      .catch(error => done(error));
  });
  it("OK, add single member to table", done => {
    request(app)
      .post(`/tables/${listTables[1]._id}/add-members`)
      .set({
        "x-access-token": owner.tokenKey
      })
      .send({
        userIds: anMember._id
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        done();
      })
      .catch(error => done(error));
  });
  it("FAIL, add wrong userId", done => {
    request(app)
      .post(`/tables/${listTables[1]._id}/add-members`)
      .set({
        "x-access-token": owner.tokenKey
      })
      .send({
        userIds: "5d9468959767571303701cf8"
      })
      .then(res => {
        expect(res.statusCode).to.equals(400);
        done();
      })
      .catch(error => done(error));
  });
  it("FAIL, wrong tableId", done => {
    request(app)
      .post(`/tables/5d9468959767571303701cf8/add-members`)
      .set({
        "x-access-token": owner.tokenKey
      })
      .send({
        userIds: "5d9468959767571303701cf8"
      })
      .then(res => {
        expect(res.statusCode).to.satisfy(status => {
          if (status === 400 || status === 403) {
            return true;
          }
        });
        done();
      })
      .catch(error => done(error));
  });
  it("FAIL, not permistion add member to table", done => {
    request(app)
      .post(`/tables/${listTables[2]._id}/add-members`)
      .set({
        "x-access-token": nonMember.tokenKey
      })
      .send({
        userIds: anMember._id
      })
      .then(res => {
        expect(res.statusCode).to.equals(403);
        done();
      })
      .catch(error => done(error));
  });
});

describe("POST /tables/:tableId/agree-join-table", () => {
  it("OK, agree join table", done => {
    request(app)
      .post(`/tables/${listTables[0]._id}/agree-join-table`)
      .set({
        "x-access-token": anMember.tokenKey
      })
      .then(res => {
        expect(res.statusCode).to.equals(200);
        done();
      })
      .catch(error => done(error));
  });
  it("FAIL, normal user can not add members", done => {
    request(app)
      .post(`/tables/${listTables[0]._id}/add-members`)
      .set({
        "x-access-token": anMember.tokenKey
      })
      .send({
        userIds: userIds[4]
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(400);
        done();
      })
      .catch(error => done(error));
  });
  it("OK, disagree join table", done => {
    request(app)
      .post(`/tables/${listTables[1]._id}/disagree-join-table`)
      .set({
        "x-access-token": anMember.tokenKey
      })
      .then(res => {
        expect(res.statusCode).to.equals(200);
        done();
      })
      .catch(error => done(error));
  });
});

describe("POST /tables/:tableId/agree-join-table", () => {
  before(done => {
    request(app)
      .post(`/auths/login`)
      .send({
        email: "kien.nguyen@amavi.asia",
        password: "12345678c"
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        kienMember = body.user;
        done();
      })
      .catch(error => done(error));
  });
  it("OK, kien.nguyen@amavi.asia agree join table", done => {
    request(app)
      .post(`/tables/${listTables[0]._id}/agree-join-table`)
      .set({
        "x-access-token": kienMember.tokenKey
      })
      .then(res => {
        expect(res.statusCode).to.equals(200);
        done();
      })
      .catch(error => done(error));
  });
});

describe("POST /tables/:tableId/remove-members", () => {
  it("OK, remove members in table", done => {
    request(app)
      .post(`/tables/${listTables[0]._id}/remove-members`)
      .set({
        "x-access-token": owner.tokenKey
      })
      .send({
        userIds: userIds[1]
      })
      .then(res => {
        expect(res.statusCode).to.equals(200);
        done();
      })
      .catch(error => done(error));
  });
});

describe("GET /tables/:tableId/show-members", () => {
  it("OK, show members in table", done => {
    request(app)
      .get(`/tables/${listTables[0]._id}/show-members`)
      .set({
        "x-access-token": owner.tokenKey
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("members");
        done();
      })
      .catch(error => done(error));
  });
});

describe("POST /tables/:tableId/delete", () => {
  it("OK, send to trash table", done => {
    request(app)
      .post(`/tables/${listTables[0]._id}/delete`)
      .set({
        "x-access-token": owner.tokenKey
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("table");
        expect(body.table.isDeleted).to.equals(1);
        done();
      })
      .catch(error => done(error));
  });
});

describe("POST /tables/:tableId/restore", () => {
  it("OK, restore table", done => {
    request(app)
      .post(`/tables/${listTables[0]._id}/restore`)
      .set({
        "x-access-token": owner.tokenKey
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("table");
        expect(body.table.isDeleted).to.equals(0);
        done();
      })
      .catch(error => done(error));
  });
});

describe("DELETE /tables/:tableId", () => {
  it("OK, delete immediately table", done => {
    request(app)
      .delete(`/tables/${listTables[4]._id}/`)
      .set({
        "x-access-token": owner.tokenKey
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("raw");
        expect(body.raw.ok).to.equals(1);
        done();
      })
      .catch(error => done(error));
  });
  it("OK, check table already deleted ?", done => {
    request(app)
      .get(`/tables/${listTables[4]._id}`)
      .set({
        "x-access-token": owner.tokenKey
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.satisfy(status => {
          if (status === 400 || status === 403) {
            return true;
          }
        });
        expect(body).to.not.contain.property("table");
        done();
      })
      .catch(error => done(error));
  });
});

describe("PUT /tables/:tableId/", () => {
  it("OK, edit table, set member can add member", done => {
    request(app)
      .put(`/tables/${listTables[0]._id}/`)
      .set({
        "x-access-token": owner.tokenKey
      })
      .send({
        title: "Table Edit",
        description: "Description Edit",
        isAllowMemberAddMember: 1
      })
      .then(res => {
        const body = res.body;
        expect(res.statusCode).to.equals(200);
        expect(body).to.contain.property("table");
        expect(body.table.title).to.equals("Table Edit");
        expect(body.table.description).to.equals("Description Edit");
        expect(body.table.allowed.isAllowMemberAddMember).to.equals(1);
        done();
      })
      .catch(error => done(error));
  });
});

describe("POST /tables/:tableId/change-user-role", () => {
  it("OK, change user role", done => {
    request(app)
      .post(
        `/tables/${listTables[0]._id}/change-user-role?userId=${kienMember._id}&role=admin`
      )
      .set({
        "x-access-token": owner.tokenKey
      })
      .then(res => {
        const body = res.body;
        body.user.tables.every(table => {
          expect(table).to.contain.property("role", "admin");
        });
        expect(res.statusCode).to.equals(200);
        done();
      })
      .catch(error => done(error));
  });
});

// describe('POST /tables/:tableId/leave-table', () => {
//     it('OK, leave table', done => {
//         request(app).post(`/tables/${listTables[0]._id}/leave-table`).set({
//             'x-access-token': anMember.tokenKey
//         }).then(res => {
//             expect(res.statusCode).to.equals(200)
//             done()
//         }).catch(error => done(error))
//     })
// })
