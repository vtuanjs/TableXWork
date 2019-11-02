'use strict'
const Table = require('./table.model')
const User = require('../user/user.model')
const Notify = require('../notify/notify.model')
const mongoose = require('mongoose')
const redis = require('../../helpers/redis')
const INVITE_JOIN_TABLE = 'Invite Join Table'

module.exports.postTable = async (req, res, next) => {
    const {
        title,
        description,
        isAllowMemberAddMember,
    } = req.body
    const signedInUser = req.user
    try {
        const table = await Table.create({
            title,
            description,
            author: signedInUser._id,
            allowed: {
                isAllowMemberAddMember,
            }
        })

        await addRefTableToUser(table._id, signedInUser)

        return res.json({
            message: `Create table successfully!`,
            table
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Add reference table to signed in user
 * @param {*} tableId 
 * @param {Object} user 
 */
const addRefTableToUser = (tableId, user) => {
    user.tables.push({
        _id: tableId,
        role: "owner",
        isJoined: 1
    })

    return user.save()
}

module.exports.deleteTable = async (req, res, next) => {
    const tableId = req.params.tableId
    try {
        const table = await setTableStatus({
            tableId,
            status: 'isDeleted',
            value: 1
        })

        if (!table) throw "Can not find table"

        return res.json({
            message: `Send table ${table.title} to trash successfully!`,
            table
        })
    } catch (error) {
        next(error)
    }
}


/**
 * 
 * @param {*} as tableId, status, value
 * @param {*} tableId
 * @param {string} status isDeleted | isStored
 * @param {number} value 0 | 1
 */
const setTableStatus = ({ tableId, status, value }) => {
    let queryUpdate
    switch (status) {
        case 'isDeleted':
            queryUpdate = {
                isDeleted: value
            }
            break
        case 'isStored':
            queryUpdate = {
                isStored: value
            }
            break
        default:
            return false
    }

    return new Promise((resole, reject) => {
        return Table.findByIdAndUpdate(
            tableId,
            queryUpdate,
            {
                upsert: true,
                new: true
            },
            (error, table) => {
                if (error) return reject(reject)
                if (table) {
                    redis.setex(tableId, 3600, JSON.stringify(table))
                    resole(table)
                }
            }
        )
    })
}

module.exports.undoDeleteTable = async (req, res, next) => {
    const tableId = req.params.tableId
    try {
        const table = await setTableStatus({
            tableId,
            status: 'isDeleted',
            value: 0
        })

        if (!table) throw "Can not find table"

        return res.json({
            message: `Restore table ${table.title} successfully!`,
            table
        })
    } catch (error) {
        next(error)
    }
}

module.exports.deleteImmediately = async (req, res, next) => {
    const tableId = req.params.tableId

    try {
        const raw = await Table.deleteOne({
            _id: tableId
        })

        await redis.del(tableId)

        return res.json({
            message: "Delete table successfully!",
            raw
        })
    } catch (error) {
        next(error)
    }
}

module.exports.storedTable = async (req, res, next) => {
    const tableId = req.params.tableId
    try {
        const table = await setTableStatus({
            tableId,
            status: 'isStored',
            value: 1
        })

        if (!table) throw "Can not find table"

        return res.json({
            message: `Stored table ${table.title} successfully!`,
            table
        })
    } catch (error) {
        next(error)
    }
}

module.exports.undoStoredTable = async (req, res, next) => {
    const tableId = req.params.tableId
    try {
        const table = await await setTableStatus({
            tableId,
            status: 'isStored',
            value: 0
        })

        if (!table) throw "Can not find table"

        return res.json({
            message: `Undo Stored table successfully!`,
            table
        })
    } catch (error) {
        next(error)
    }
}

module.exports.updateTable = async (req, res, next) => {
    const tableId = req.params.tableId
    const {
        title,
        description,
        isAllowMemberAddMember,
    } = req.body
    try {

        const query = getQueryUpdateTable({
            title,
            description,
            isAllowMemberAddMember
        })

        const table = await Table.findByIdAndUpdate(
            tableId,
            query,
            {
                new: true
            }
        )

        if (!table) throw "Can not find table"

        await redis.setex(tableId, 3600, JSON.stringify(table))

        return res.json({
            message: `Update table successfully!`,
            table
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Query update table
 * @param {*} as title, description, isAllowMemberAddMember  
 */
const getQueryUpdateTable = ({ title, description, isAllowMemberAddMember }) => {
    let query = {
        ...(title && { title }),
        ...(description && { description })
    }

    if (isAllowMemberAddMember === 0) {
        query = {
            ...query,
            'allowed.isAllowMemberAddMember': 0
        }
    }

    if (isAllowMemberAddMember === 1) {
        query = {
            ...query,
            'allowed.isAllowMemberAddMember': 1
        }
    }

    return query
}

module.exports.getTables = async (req, res, next) => {
    const signedInUser = req.user
    const fields = req.query.fields

    const selectFields = selectFieldsShow(fields)

    try {
        const arrayTable = signedInUser.tables.map(table => {
            return table._id
        })

        const tables = await Table.find({
            _id: {
                $in: arrayTable
            }
        }).populate('author', 'name')
            .select(selectFields)

        return res.json({
            tables
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

module.exports.getTable = async (req, res, next) => {
    const tableId = req.params.tableId
    const fields = req.query.fields

    const selectFields = selectFieldsShow(fields)

    try {
        // First, find table data from redis store
        // If can not found it, find it from database
        const store = await redis.get(tableId)
        if (store) {
            return res.json({ table: JSON.parse(store) })
        } else {
            const table = await Table.findById(tableId).select(selectFields)

            if (!table) throw "Wrong table id"

            // Store data to redis
            await redis.setex(tableId, 3600, JSON.stringify(table))

            return res.json({
                table
            })
        }
    } catch (error) {
        next(error)
    }
}

module.exports.addMembers = async (req, res, next) => {
    const userIds = req.body.userIds
    const tableId = req.params.tableId
    const signedInUser = req.user
    const session = await mongoose.startSession()
    try {
        await session.withTransaction(async () => {
            const arrayUserIds = splitUserIds(userIds)

            // Check both table and users exist?
            const [table, verifyUserIds] = await Promise.all([
                Table.findById(tableId),
                getVerifyUserIds(arrayUserIds)
            ])

            if (verifyUserIds.length === 0) throw 'Can not find any user"'

            if (!isAllowed({
                table,
                idCheck: tableId,
                userCheck: signedInUser
            })) {
                throw 'Member can not add member'
            }

            await Promise.all([
                addRefTableToUsers({
                    tableId,
                    userIds: verifyUserIds,
                    session
                }),
                createNotifyJoinTable({
                    message: `${signedInUser.name} invite you join table ${table.title}`,
                    tableId,
                    userIds: verifyUserIds,
                    session
                })
            ])

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
 * Save id table to all members
 * @param {*} as tableId, userIds, session
 */
const addRefTableToUsers = ({
    tableId,
    userIds,
    session
}) => {
    return User.updateMany({
        _id: {
            $in: userIds
        },
        "tables._id": {
            $ne: tableId
        }
    }, {
        $push: {
            tables: {
                _id: tableId,
                role: "user",
                isJoined: 0
            }
        }
    }).session(session)
}

/**
 * Notify to all users join table
 * @param {*} as message, tableId, userIds, session 
 */
const createNotifyJoinTable = ({
    message,
    tableId,
    userIds,
    session
}) => {
    let arrayNotifyCreate = []
    // Creating an array query creates multiple notifies
    for (let index = 0; index < userIds.length; index++) {
        arrayNotifyCreate.push({
            title: INVITE_JOIN_TABLE,
            message: message,
            secretKey: {
                tableId
            },
            user: userIds[index]
        })
    }

    return Notify.create(arrayNotifyCreate, {
        session
    })
}

/**
 * If isAllowMemberAddMember = 0, normal user can not add new member to table
 * @param {*} as table, idCheck, userCheck 
 */
const isAllowed = ({ table, idCheck, userCheck }) => {
    if (!table.allowed.isAllowMemberAddMember && userCheck.tables.some(item => {
        return item._id.equals(idCheck) && item.role === 'user'
    })) {
        return false
    }
    return true
}

module.exports.agreeJoinTable = async (req, res, next) => {
    const tableId = req.params.tableId
    const signedInUser = req.user
    try {
        await Promise.all([
            User.findOneAndUpdate({
                _id: signedInUser._id,
            }, {
                $set: {
                    'tables.$[element].isJoined': 1
                }
            }, {
                arrayFilters: [{
                    'element._id': tableId
                }],
            }),

            Notify.updateOne({
                user: signedInUser._id,
                title: INVITE_JOIN_TABLE,
                'secretKey.tableId': tableId
            }, {
                $unset: {
                    secretKey: {
                        tableId
                    }
                },
                isAction: 1
            })
        ])

        return res.json({
            message: 'Join table successfully!'
        })
    } catch (error) {
        next(error)
    }
}

module.exports.disAgreeJoinTable = async (req, res, next) => {
    const tableId = req.params.tableId
    const signedInUser = req.user
    try {
        await Promise.all([
            User.updateOne({
                _id: signedInUser._id,
                'tables._id': tableId
            }, {
                $pull: {
                    tables: {
                        _id: tableId
                    }
                }
            }),

            Notify.updateOne({
                user: signedInUser._id,
                title: INVITE_JOIN_TABLE,
                'secretKey.tableId': tableId
            }, {
                $unset: {
                    secretKey: {
                        tableId
                    }
                },
                isAction: 1
            })
        ])

        return res.json({
            message: 'Disagree join table successfully!'
        })
    } catch (error) {
        next(error)
    }
}


module.exports.removeMembers = async (req, res, next) => {
    const userIds = req.body.userIds
    const { tableId } = req.params
    try {
        const arrayUserIds = splitUserIds(userIds)

        await User.updateMany({
            _id: {
                $in: arrayUserIds
            }
        }, {
            $unset: {
                tables: {
                    _id: tableId
                }
            }
        })

        return res.json({
            message: `Remove member successfully!`,
        })
    } catch (error) {
        next(error)
    }
}

const handleShowMembers = (members, tableId) => {
    return members.map(member => {
        const tables = member.tables.filter(table => {
            return table._id.equals(tableId)
        })

        return {
            _id: member._id,
            name: member._name,
            table: tables[0]
        }
    })
}

module.exports.showMembers = async (req, res, next) => {
    let { tableId } = req.params
    try {
        const members = await User.find({ 'tables._id': tableId })

        if (!members) {
            throw 'Can not find any members'
        }

        return res.json({ members: handleShowMembers(members, tableId) })
    } catch (error) {
        next(error)
    }
}

module.exports.leaveTable = async (req, res, next) => {
    const { tableId } = req.params
    const signedInUser = req.user
    try {
        await User.updateOne({
            _id: signedInUser._id
        }, {
            $unset: {
                tables: {
                    _id: tableId
                }
            }
        })

        return res.json({
            message: `Leave table successfully!`,
        })
    } catch (error) {
        next(error)
    }
}

module.exports.changeUserRole = async (req, res, next) => {
    const tableId = req.params.tableId
    const {
        userId,
        role
    } = req.body

    try {
        debugger
        const user = await User.findOneAndUpdate({
            _id: userId,
            'tables._id': tableId
        }, {
            $set: {
                "tables.$[element].role": role
            }
        }, {
            arrayFilters: [{
                'element._id': tableId
            }],
            new: true
        })
        if (!user) throw "Can not find user/table or user not a member in table"

        return res.json({
            message: `${user.name} is now ${role}!`,
            user: {
                _id: user._id,
                tables: user.tables
            }
        })
    } catch (error) {
        next(error)
    }
}