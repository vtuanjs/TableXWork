const express = require("express");
const router = express.Router({ mergeParams: true });
const comment = require("../controllers/comment");
const authentication = require("../middlewares/auth");
const checkPermit = require("../middlewares/permistion");

router.use(authentication.required);

router.post(
  "/",
  checkPermit({
    model: "cell",
    roles: "user"
  }),
  comment.postComment
);

router.put("/:commentId", comment.updateComment);

router.delete("/:commentId", comment.deleteComment);

router.get(
  "/",
  checkPermit({
    model: "cell",
    roles: "user"
  }),
  comment.getComments
);

router.get(
  "/:commentId",
  checkPermit({
    model: "cell",
    roles: "user"
  }),
  comment.getComment
);

module.exports = router;
