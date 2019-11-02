const Row = require('./row.model')
const redis = require('../../helpers/redis')

module.exports.postRow = async (req, res, next) => {
    const {
        title,
        description,
    } = req.body
    const tableId = req.query.tableId
    const signedInUser = req.user
    try {
        const row = await Row.create({
            title,
            description,
            author: signedInUser._id,
            table: tableId,
        })

        return res.json({
            message: `Create row successfully!`,
            row
        })
    } catch (error) {
        next(error)
    }
}

module.exports.getRows = async (req, res, next) => {
    const { tableId, fields } = req.query

    const selectFields = selectFieldsShow(fields)
    try {
        const rows = await Row.find({
            table: tableId,
        }).select(selectFields)

        return res.json({
            rows
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Format query select fields
 * @param {string} fields 
 */
const selectFieldsShow = fields => {
    if (fields) {
        return fields.split(',').join(' ')
    }

    return ""
}

module.exports.getRow = async (req, res, next) => {
    const rowId = req.params.rowId
    const fields = req.query.fields

    const selectFields = selectFieldsShow(fields)
    try {
        const store = await redis.get(rowId)

        if (store) {
            res.json({ row: JSON.parse(store) })
        } else {
            const row = await Row.findById(rowId).select(selectFields)

            if (!row) throw "Wrong row id"

            await redis.setex(rowId, 3600, JSON.stringify(row))

            return res.json({
                row
            })
        }
    } catch (error) {
        next(error)
    }
}

module.exports.deleteRow = async (req, res, next) => {
    const rowId = req.params.rowId

    try {
        const raw = await Row.deleteOne({
            _id: rowId
        })

        await redis.del(rowId)

        return res.json({
            message: "Delete row successfully!",
            raw
        })
    } catch (error) {
        next(error)
    }
}

module.exports.updateRow = async (req, res, next) => {
    const rowId = req.params.rowId
    const {
        title,
        description,
    } = req.body
    try {
        const row = await Row.findByIdAndUpdate(rowId, {
            ...(title && { title }),
            ...(description && { description })
        }, {
            new: true
        })

        if (!row) throw "Can not find row with this ID"

        await redis.setex(rowId, 3600, JSON.stringify(row))

        return res.json({
            message: `Update row successfully!`,
            row
        })
    } catch (error) {
        next(error)
    }
}