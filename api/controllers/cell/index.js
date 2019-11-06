'use strict'
const Cell = require('./cell.model')
const User = require('../user/user.model')
const Row = require('../row/row.model')
const Column = require('../column/column.model')
const mongoose = require('mongoose')
const redis = require('../../helpers/redis')
const redisLife = parseInt(process.env.REDIS_QUERY_LIFE)

module.exports.postCell = async (req, res, next) => {
    const { body, description, rowId, columnId } = req.body

    const tableId = req.params.tableId
    const signedInUser = req.user
    try {
        // Check row and column exists?
        const [row, column] = await Promise.all([
            Row.findOne({
                _id: rowId,
                table: tableId
            }),
            Column.findOne({
                _id: columnId,
                table: tableId
            })
        ])

        if (!row || !column) {
            throw 'Can not find row or column'
        }

        const cell = await Cell.create({
            body,
            description,
            author: signedInUser._id,
            row: rowId,
            column: columnId,
            table: tableId
        })

        await addRefCellToUser(cell._id, signedInUser)

        return res.json({
            message: `Create cell successfully!`,
            cell
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Add reference cell to signed in user
 * @param {*} cellId 
 * @param {Object} user 
 */
const addRefCellToUser = (cellId, user) => {
    user.cells.push({
        _id: cellId,
        role: 'owner',
        isJoined: 1
    })

    return user.save()
}

module.exports.getCells = async (req, res, next) => {
    let fields = req.query.fields
    const { tableId } = req.params
    const { rowId, columnId } = req.query

    if (fields) {
        // Convert fields to array
        // Do not return 'body' and 'attackFiles' when find all cells.
        fields = fields.split(',').join(' ').replace('body', '').replace('attachFiles', '')
    } else {
        fields = '-body -attachFiles'
    }

    try {
        const cells = await Cell.find({
            table: tableId,
            ...(rowId && { rowId }),
            ...(columnId && { columnId })
        }).select(fields)

        return res.json({
            cells
        })
    } catch (error) {
        next(error)
    }
}

module.exports.getCell = async (req, res, next) => {
    const { cellId, tableId } = req.params
    let fields = req.query.fields

    if (fields) {
        // Convert fields to array
        fields = fields.split(',').join(' ').replace('body', '')
    } else {
        fields = ''
    }

    try {
        // First, find cell data from redis store
        // If can not found it, find it from database
        const store = await redis.get(cellId)
        if (store) {
            return res.json({ cell: JSON.parse(store) })
        } else {
            const cell = await Cell.findOne({
                _id: cellId,
                table: tableId
            }).select(fields)

            if (!cell) throw 'Wrong cell id'

            // Store data to redis
            await redis.setex(cellId, redisLife, JSON.stringify(cell))

            return res.json({
                cell
            })
        }
    } catch (error) {
        next(error)
    }
}

module.exports.deleteCell = async (req, res, next) => {
    const { cellId, tableId } = req.params

    try {
        const raw = await Cell.deleteOne({
            _id: cellId,
            table: tableId
        })
        await redis.del(cellId)

        return res.json({
            message: 'Delete cell successfully!',
            raw
        })
    } catch (error) {
        next(error)
    }
}

module.exports.updateCell = async (req, res, next) => {
    const { cellId, tableId } = req.params
    const { body, description } = req.body
    try {
        const cell = await Cell.findOneAndUpdate(
            {
                _id: cellId,
                table: tableId
            },
            {
                ...(body && { body }),
                ...(description && { description })
            },
            {
                new: true
            }
        )

        if (!cell) throw 'Can not find cell'

        await redis.setex(cellId, redisLife, JSON.stringify(cell))

        return res.json({
            message: `Update cell successfully!`,
            cell
        })
    } catch (error) {
        next(error)
    }
}

module.exports.addMembers = async (req, res, next) => {
    const userIds = req.body.userIds
    const { cellId, tableId } = req.params
    const session = await mongoose.startSession()
    try {
        await session.withTransaction(async () => {
            const arrayUserIds = splitUserIds(userIds)

            // Check both cell and users exist?
            const [cell, verifyUserIds] = await Promise.all([
                Cell.findOne({
                    _id: cellId,
                    table: tableId
                }),
                getVerifyUserIds(arrayUserIds)
            ])

            if (!cell) throw 'Can not find cell with this id'

            if (verifyUserIds.length === 0) throw 'Can not find any user'

            await addRefCellToUsers({
                cellId,
                userIds: verifyUserIds
            })

            return res.json({
                message: `Add member successfully!`
            })
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Check input value. If it's a string, convert it to an array
 * @param {string | array} userIds 
 */
const splitUserIds = (userIds) => {
    if (typeof userIds === 'string') {
        return userIds.split(',').map(item => {
            return item.trim()
        })
    } else {
        return userIds
    }
}

/**
 * Return new verified userIds
 * @param {*} userIds 
 */
const getVerifyUserIds = (userIds) => {
    return new Promise((resole, reject) => {
        return User.find({
            _id: {
                $in: userIds
            }
        }, (error, users) => {
            if (error) {
                return reject(error)
            }

            return resole(users.map(user => user._id))
        })
    })
}

/**
 * Save id cell to all members
 * @param {*} as cellId, userIds, session
 */
const addRefCellToUsers = ({
    cellId,
    userIds
}) => {
    return User.updateMany({
        _id: {
            $in: userIds
        },
        'cells._id': {
            $ne: cellId
        }
    }, {
        $push: {
            cells: {
                _id: cellId,
                role: 'user',
            }
        }
    })
}

module.exports.removeMembers = async (req, res, next) => {
    const userIds = req.body.userIds
    const { cellId, tableId } = req.params
    try {
        const arrayUserIds = splitUserIds(userIds)

        const cell = await Cell.findOne({
            _id: cellId,
            table: tableId
        })

        if (!cell) throw 'Can not find cell with this id'

        const raw = await User.updateMany(
            {
                _id: {
                    $in: arrayUserIds
                }
            }, {
            $pull: {
                cells: {
                    _id: cellId
                }
            }
        })

        if (!raw.ok) {
            throw 'Can not remove members'
        }

        return res.json({
            message: `Remove members successfully!`,
            raw
        })
    } catch (error) {
        next(error)
    }
}

module.exports.showMembers = async (req, res, next) => {
    let { cellId, tableId } = req.params
    try {
        const [cell, members] = await Promise.all([
            Cell.findOne({
                _id: cellId,
                table: tableId
            }),

            User.find({
                'cells._id': cellId,
            })
        ])

        if (!cell) {
            throw 'Can not find cell with id'
        }

        if (!members) {
            throw 'Can not find any members'
        }

        return res.json({ members: handleShowMembers(members, cellId) })
    } catch (error) {
        next(error)
    }
}

/**
 * Handle show members
 * @param {*} members 
 * @param {*} cellId 
 */
const handleShowMembers = (members, cellId) => {
    return members.map(member => {
        const cells = member.cells.filter(cell => {
            return cell._id.equals(cellId)
        })

        return {
            _id: member._id,
            name: member._name,
            cell: cells[0]
        }
    })
}

module.exports.changeUserRole = async (req, res, next) => {
    const { cellId, tableId } = req.params
    const { userId, role } = req.query

    try {
        const cell = await Cell.findOne({
            _id: cellId,
            table: tableId
        })

        if (!cell){
            throw 'Can not find cell or it not in this table'
        }

        const user = await User.findOneAndUpdate({
            _id: userId,
            'cells._id': cellId,
        }, {
            $set: {
                'cells.$[element].role': role
            }
        }, {
            arrayFilters: [{
                'element._id': cellId
            }],
            new: true
        })

        if (!user) throw 'Can not find user/cell or user not a member in cell'

        return res.json({
            message: `${user.name} is now ${role} this cell!`,
            user: {
                _id: user._id,
                cells: user.cells
            }
        })
    } catch (error) {
        next(error)
    }
}

module.exports.leaveCell = async (req, res, next) => {
    const { cellId } = req.params
    const signedInUser = req.user
    try {
        const raw = await User.updateOne({
            _id: signedInUser._id
        }, {
            $pull: {
                cells: {
                    _id: cellId
                }
            }
        })

        if (!raw.ok) {
            throw 'Can not leave cell'
        }

        return res.json({
            message: `Leave cell successfully!`,
        })
    } catch (error) {
        next(error)
    }
}