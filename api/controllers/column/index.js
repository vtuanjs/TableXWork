const Column = require('./column.model')
const redis = require('../../helpers/redis')
const redisLife = parseInt(process.env.REDIS_QUERY_LIFE)

module.exports.postColumn = async (req, res, next) => {
    const {
        title,
        description,
    } = req.body
    const tableId = req.params.tableId
    const signedInUser = req.user
    try {
        const column = await Column.create({
            title,
            description,
            author: signedInUser._id,
            table: tableId,
        })

        return res.json({
            message: `Create column successfully!`,
            column
        })
    } catch (error) {
        next(error)
    }
}

module.exports.getColumns = async (req, res, next) => {
    const { fields } = req.query
    const { tableId } = req.params

    const selectFields = selectFieldsShow(fields)
    try {
        const columns = await Column.find({
            table: tableId,
        }).select(selectFields)

        return res.json({
            columns
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

module.exports.getColumn = async (req, res, next) => {
    const { columnId, tableId } = req.params
    const fields = req.query.fields

    const selectFields = selectFieldsShow(fields)
    try {
        const store = await redis.get(columnId)

        if (store) {
            res.json({ column: JSON.parse(store) })
        } else {
            const column = await Column.findOne({
                _id: columnId,
                table: tableId
            }).select(selectFields)

            if (!column) throw "Wrong column id"

            await redis.setex(columnId, redisLife, JSON.stringify(column))

            return res.json({
                column
            })
        }
    } catch (error) {
        next(error)
    }
}

module.exports.deleteColumn = async (req, res, next) => {
    const { columnId, tableId } = req.params

    try {
        const raw = await Column.deleteOne({
            _id: columnId,
            table: tableId
        })

        await redis.del(columnId)

        return res.json({
            message: "Delete column successfully!",
            raw
        })
    } catch (error) {
        next(error)
    }
}

module.exports.updateColumn = async (req, res, next) => {
    const {columnId, tableId} = req.params
    const {
        title,
        description,
    } = req.body
    try {
        const column = await Column.findOneAndUpdate({
            _id: columnId,
            table: tableId
        }, {
            ...(title && { title }),
            ...(description && { description })
        }, {
            new: true
        })

        if (!column) throw "Can not find column with this ID"

        await redis.setex(columnId, redisLife, JSON.stringify(column))

        return res.json({
            message: `Update column successfully!`,
            column
        })
    } catch (error) {
        next(error)
    }
}