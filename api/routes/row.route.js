const express = require("express")
const router = express.Router()
const row = require("../controllers/row")
const authentication = require("../middlewares/auth")
const checkPermit = require("../middlewares/permistion")

router.post("/", authentication.required, row.postRow)

router.get("/", authentication.required, checkPermit({
    model: 'table',
    role: 'user',
    source: 'query'
}), row.getRows)

router.get("/:rowId", authentication.required, checkPermit({
    model: "table",
    role: "user",
    source: "params"
}), row.getRow)

router.delete("/:rowId", authentication.required, checkPermit({
    model: "row",
    role: "owner",
    source: "params"
}), row.deleteRow)

router.put("/:rowId", authentication.required, checkPermit({
    model: "row",
    role: "owner",
    source: "params"
}), row.updateRow)

module.exports = router