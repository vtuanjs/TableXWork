const express = require("express")
const router = express.Router()
const table = require("../controllers/table")
const authentication = require("../middlewares/auth")
const checkPermit = require("../middlewares/permistion")

router.post("/", authentication.required, table.postTable)

router.post("/:tableId/delete", authentication.required, (req, res, next) => {
    const user = req.user
    const tableId = req.params.tableId

    checkPermit({ user, modelCheck: 'table', roles: 'admin', id: tableId })(req, res, next)
}, table.deleteTable)

router.post("/:tableId/restore", authentication.required, (req, res, next) => {
    const user = req.user
    const tableId = req.params.tableId

    checkPermit({ user, modelCheck: 'table', roles: 'admin', id: tableId })(req, res, next)
}, table.undoDeleteTable)

router.delete("/:tableId", authentication.required, (req, res, next) => {
    const user = req.user
    const tableId = req.params.tableId

    checkPermit({ user, modelCheck: 'table', roles: 'admin', id: tableId })(req, res, next)
}, table.deleteImmediately)

router.post("/:tableId/stored", authentication.required, (req, res, next) => {
    const user = req.user
    const tableId = req.params.tableId

    checkPermit({ user, modelCheck: 'table', roles: 'admin', id: tableId })(req, res, next)
}, table.storedTable)

router.post("/:tableId/undoStored", authentication.required, (req, res, next) => {
    const user = req.user
    const tableId = req.params.tableId

    checkPermit({ user, modelCheck: 'table', roles: 'admin', id: tableId })(req, res, next)
}, table.undoStoredTable)

router.put("/:tableId", authentication.required, (req, res, next) => {
    const user = req.user
    const tableId = req.params.tableId

    checkPermit({ user, modelCheck: 'table', roles: 'admin', id: tableId })(req, res, next)
}, table.updateTable)

router.get("/", authentication.required, table.getTables)

router.get("/:tableId", authentication.required, (req, res, next) => {
    const user = req.user
    const tableId = req.params.tableId

    checkPermit({ user, modelCheck: 'table', roles: 'user', id: tableId })(req, res, next)
}, table.getTable)

router.post("/:tableId/add-members", authentication.required, (req, res, next) => {
    const user = req.user
    const tableId = req.params.tableId

    checkPermit({ user, modelCheck: 'table', roles: 'user', id: tableId })(req, res, next)
}, table.addMembers)

router.post("/:tableId/remove-members", authentication.required, (req, res, next) => {
    const user = req.user
    const tableId = req.params.tableId

    checkPermit({ user, modelCheck: 'table', roles: 'admin', id: tableId })(req, res, next)
}, table.removeMembers)

router.get("/:tableId/show-members", authentication.required, table.showMembers)

router.post("/:tableId/agree-join-table", authentication.required, table.agreeJoinTable)

router.post("/:tableId/disagree-join-table", authentication.required, table.disAgreeJoinTable)

router.post("/:tableId/leave-table", authentication.required, table.leaveTable)

router.post("/:tableId/change-user-role", authentication.required, (req, res, next) => {
    const user = req.user
    const tableId = req.params.tableId

    checkPermit({ user, modelCheck: 'table', roles: 'admin', id: tableId })(req, res, next)
}, table.changeUserRole)

module.exports = router