const express = require("express");
const router = express.Router();
const team = require("../controllers/team");
const authentication = require("../middlewares/auth");
const checkPermit = require("../middlewares/permistion");

// Required auth
router.use(authentication.required);

router.post("/", team.postTeam);

router.get("/", team.getTeams);

router.get("/get-by-user", team.getTeamsByUser);

router.get(
  "/:teamId",
  checkPermit({
    model: "team",
    roles: "admin"
  }),
  team.getDetail
);

router.put(
  "/:teamId",
  checkPermit({
    model: "team",
    roles: "admin"
  }),
  team.updateTeam
);

router.post(
  "/:teamId/add-members",
  checkPermit({
    model: "team",
    roles: "user"
  }),
  team.addMembers
);

router.post(
  "/:teamId/remove-members",
  checkPermit({
    model: "team",
    roles: "admin"
  }),
  team.removeMembers
);

router.post("/:teamId/agree-join-team", team.agreeJoinTeam);

router.post("/:teamId/disagree-join-team", team.disAgreeJoinTeam);

router.post("/:teamId/leave-team", team.leaveTeam);

router.get("/:teamId/show-members", team.showMembers);

router.delete(
  "/:teamId/",
  checkPermit({
    model: "team",
    roles: "admin"
  }),
  team.deleteTeam
);

router.post(
  "/:teamId/change-user-role",
  checkPermit({
    model: "team",
    roles: "admin"
  }),
  team.changeUserRole
);

module.exports = router;
