const express = require("express")
const router = express.Router({mergeParams: true})
const column = require("../controllers/column")
const authentication = require("../middlewares/auth")
const checkPermit = require("../middlewares/permistion")

router.use(authentication.required)

router.post("/", checkPermit({
    model: 'table',
    roles: 'admin'
}), column.postColumn)

router.get("/", checkPermit({
    model: 'table',
    roles: 'user'
}), column.getColumns)

router.get("/:columnId", checkPermit({
    model: 'table',
    roles: 'user'
}), column.getColumn)

router.delete("/:columnId", checkPermit({
    model: 'table',
    roles: 'admin'
}), column.deleteColumn)

router.put("/:columnId", checkPermit({
    model: 'table',
    roles: 'admin'
}), column.updateColumn)

module.exports = router