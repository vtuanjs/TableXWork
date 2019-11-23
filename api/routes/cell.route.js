const express = require("express");
const router = express.Router({ mergeParams: true });
const cell = require("../controllers/cell");
const authentication = require("../middlewares/auth");
const checkPermit = require("../middlewares/permistion");

router.use(authentication.required);

router.post(
  "/",
  checkPermit({
    model: "table",
    roles: "user"
  }),
  cell.postCell
);

router.get(
  "/",
  checkPermit({
    model: "table",
    roles: "user"
  }),
  cell.getCells
);

router.get(
  "/:cellId",
  checkPermit({
    model: "table",
    roles: "user"
  }),
  cell.getCell
);

router.delete(
  "/:cellId",
  checkPermit(
    {
      model: "table",
      roles: "admin"
    },
    {
      model: "cell",
      roles: "admin"
    }
  ),
  cell.deleteCell
);

router.put(
  "/:cellId",
  checkPermit(
    {
      model: "table",
      roles: "admin"
    },
    {
      model: "cell",
      roles: "admin"
    }
  ),
  cell.updateCell
);

router.post(
  "/:cellId/add-members",
  checkPermit(
    {
      model: "table",
      roles: "admin"
    },
    {
      model: "cell",
      roles: "admin"
    }
  ),
  cell.addMembers
);

router.post(
  "/:cellId/remove-members",
  checkPermit(
    {
      model: "table",
      roles: "admin"
    },
    {
      model: "cell",
      roles: "admin"
    }
  ),
  cell.removeMembers
);

router.get(
  "/:cellId/show-members",
  checkPermit({
    model: "table",
    roles: "user"
  }),
  cell.showMembers
);

router.post(
  "/:cellId/change-user-role",
  checkPermit(
    {
      model: "table",
      roles: "admin"
    },
    {
      model: "cell",
      roles: "admin"
    }
  ),
  cell.changeUserRole
);

router.post("/:cellId/leave-cell", cell.leaveCell);

module.exports = router;
