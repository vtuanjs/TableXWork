const express = require("express")
const router = express.Router()
const user = require("../controllers/user")
const authentication = require("../middlewares/auth")
const checkPermit = require("../middlewares/permistion")

router.post("/", user.postUser)

router.post("/admin/", user.postAdmin)

router.post("/admin/:userIds/block", authentication.required, (req, res, next) => {
    const user = req.user
    checkPermit({user, modelCheck: 'user', roles: 'admin'})(req, res, next)
}, user.blockUsers)

router.post("/admin/:userIds/unlock", authentication.required, (req, res, next) => {
    const user = req.user
    checkPermit({user, modelCheck: 'user', roles: 'admin'})(req, res, next)
}, user.unlockUsers)

router.get("/", user.getUsers)

router.get("/:userId", user.getUser)

router.put("/:userId", authentication.required, (req, res, next) => {
    const user = req.user
    const userId = req.params.userId

    if (user._id.equals(userId)) return next()

    checkPermit({user, modelCheck: 'user', roles: 'admin'})(req, res, next)
}, user.updateUser) // Edit

router.delete("/admin/:userId", authentication.required, (req, res, next) => {
    const user = req.user
    checkPermit({user, modelCheck: 'user', roles: 'admin'})(req, res, next)
}, user.deleteUser)

module.exports = router