const express = require("express");
const router = express.Router();
const table = require("../controllers/table");
const authentication = require("../middlewares/auth");
const checkPermit = require("../middlewares/permistion");

router.use(authentication.required);

router.post("/", table.postTable);

router.post(
  "/:tableId/delete",
  checkPermit({
    model: "table",
    roles: "admin"
  }),
  table.deleteTable
);

router.post(
  "/:tableId/restore",
  checkPermit({
    model: "table",
    roles: "admin"
  }),
  table.undoDeleteTable
);

router.delete(
  "/:tableId",
  checkPermit({
    model: "table",
    roles: "admin"
  }),
  table.deleteImmediately
);

router.post(
  "/:tableId/stored",
  checkPermit({
    model: "table",
    roles: "admin"
  }),
  table.storedTable
);

router.post(
  "/:tableId/undoStored",
  checkPermit({
    model: "table",
    roles: "admin"
  }),
  table.undoStoredTable
);

router.put(
  "/:tableId",
  checkPermit({
    model: "table",
    roles: "admin"
  }),
  table.updateTable
);

router.get("/", table.getTables);

router.get(
  "/:tableId",
  checkPermit({
    model: "table",
    roles: "user"
  }),
  table.getTable
);

router.post(
  "/:tableId/add-members",
  checkPermit({
    model: "table",
    roles: "user"
  }),
  table.addMembers
);

router.post(
  "/:tableId/remove-members",
  checkPermit({
    model: "table",
    roles: "user"
  }),
  table.removeMembers
);

router.get(
  "/:tableId/show-members",
  checkPermit({
    model: "table",
    roles: "user"
  }),
  table.showMembers
);

router.post("/:tableId/agree-join-table", table.agreeJoinTable);

router.post("/:tableId/disagree-join-table", table.disAgreeJoinTable);

router.post("/:tableId/leave-table", table.leaveTable);

router.post(
  "/:tableId/change-user-role",
  checkPermit({
    model: "table",
    roles: "admin"
  }),
  table.changeUserRole
);

module.exports = router;
