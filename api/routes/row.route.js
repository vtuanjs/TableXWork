const express = require("express");
const router = express.Router({ mergeParams: true });
const row = require("../controllers/row");
const authentication = require("../middlewares/auth");
const checkPermit = require("../middlewares/permistion");

router.use(authentication.required);

router.post(
  "/",
  checkPermit({
    model: "table",
    roles: "admin"
  }),
  row.postRow
);

router.get(
  "/",
  checkPermit({
    model: "table",
    roles: "user"
  }),
  row.getRows
);

router.get(
  "/:rowId",
  checkPermit({
    model: "table",
    roles: "user"
  }),
  row.getRow
);

router.delete(
  "/:rowId",
  checkPermit({
    model: "table",
    roles: "admin"
  }),
  row.deleteRow
);

router.put(
  "/:rowId",
  checkPermit({
    model: "table",
    roles: "admin"
  }),
  row.updateRow
);

module.exports = router;
