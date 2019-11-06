const express = require("express")
const router = express.Router()
const user = require("../controllers/user")
const authentication = require("../middlewares/auth")
const checkPermit = require("../middlewares/permistion")

router.post("/", user.postUser)

router.post("/admin/", user.postAdmin)

router.get("/:userId", user.getUser)

router.get("/email/:email", user.getByEmail)

// Require auth
router.use(authentication.required)

router.get("/", checkPermit({
    model: 'user', roles: 'mod'
}), user.getUsers)

router.post("/admin/:userIds/block", checkPermit({
    model: 'user', roles: 'admin'
}), user.blockUsers)

router.post("/admin/:userIds/unlock", checkPermit({
    model: 'user', roles: 'admin'
}), user.unlockUsers)

router.put("/:userId", (req, res, next) => {
    // User can edit user's self
    const user = req.user
    const userId = req.params.userId
    if (user._id.equals(userId)) return next()

    checkPermit({
        model: 'user', roles: 'admin'
    })(req, res, next)
}, user.updateUser)

router.delete("/admin/:userId", checkPermit({
    model: 'user', roles: 'admin'
}), user.deleteUser)

router.post("/admin/:userId/change-user-role", checkPermit({
    model: 'user', roles: 'admin'
}), user.changeUserRole)

module.exports = router
