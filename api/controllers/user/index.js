'use strict'
const bcrypt = require('bcrypt')
const User = require('./user.model')

module.exports.postUser = async (req, res, next) => {
    const { name, email, password } = req.body
    try {
        if (!validatePassword(password)) {
            throw "Password must be eight characters or longer, must contain at least 1 numeric character, 1 lowercase charater"
        }

        const user = await User.create({
            name,
            email,
            password
        })

        return res.json({
            message: `Create user ${user.name} successfully!`,
            user
        })
    } catch (error) {
        if (error.code === 11000) error = "Email already exists"
        next(error)
    }
}

/**
 * Validate input password. Password must be eight characters or longer, must contain at least 1 numeric character, 1 lowercase charater' 
 * @param {string} password 
 */
const validatePassword = (password) => {
    const pwdRegex = new RegExp('^(?=.*[a-z])(?=.*[0-9])(?=.{8,})')
    return password.match(pwdRegex)
}

module.exports.postAdmin = async (req, res, next) => {
    const { name, email, password } = req.body
    try {
        if (await isAdminExist()) {
            throw "This function only use one time!"
        }
        if (!validatePassword(password)) {
            throw "Password must be eight characters or longer, must contain at least 1 numeric character, 1 lowercase charater"
        }

        const user = await User.create({
            name,
            email,
            role: "admin",
            password
        })

        return res.json({
            message: `Create admin ${user.name} successfully!`,
            user
        })
    } catch (error) {
        next(error)
    }
}

const isAdminExist = () => {
    return User.findOne({
        role: "admin"
    })
}

module.exports.updateUser = async (req, res, next) => {
    let {
        name,
        gender,
        phone,
        address,
        password,
        oldPassword
    } = req.body
    const { userId } = req.params
    try {
        const user = await User.findById(userId)

        if (password) {
            if (!validatePassword(password)) {
                throw "Password must be eight characters or longer, must contain at least 1 numeric character, 1 lowercase charater"
            }

            await comparePassword(oldPassword, user.password)
        }

        const query = {
            ...(name && { name }),
            ...(gender && { gender }),
            ...(phone && { phone }),
            ...(address && { address }),
            ...(password && { password }),
        }

        Object.assign(user, query)

        await user.save()

        return res.json({
            message: `Update user with ID: ${user._id} succesfully!`,
            user
        })
    } catch (error) {
        next("Update error: " + error)
    }
}

/**
 * Compare old password and new password
 * @param {*} oldPassword 
 * @param {*} password 
 */
const comparePassword = (oldPassword, password) => {
    return bcrypt.compare(oldPassword, password)
        .then(same => {
            if (!same) {
                throw "Old password wrong"
            }
        })
}

module.exports.blockUsers = async (req, res, next) => {
    const { userIds } = req.params
    try {
        const raw = await setIsBannedUsers(userIds, 1)

        return res.json({
            message: "Block users successfully!",
            raw
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Convert string userIds to array
 * @param {*} userIds 
 */
const splitUsers = (userIds) => {
    if (typeof userIds === 'string') {
        return userIds.split(',').map(item => {
            return item.trim()
        })
    }

    return userIds
}

/**
 * 
 * @param {*} userIds 
 * @param {0 | 1} status
 */
const setIsBannedUsers = (userIds, status) => {
    return User.updateMany({
        _id: {
            $in: splitUsers(userIds)
        },
        role: {
            $ne: 'admin'
        }
    }, {
        $set: {
            isBanned: status
        }
    })
}

module.exports.unlockUsers = async (req, res, next) => {
    const {
        userIds
    } = req.params
    try {
        const raw = await setIsBannedUsers(userIds, 0)

        return res.json({
            message: "Unlock users successfully!",
            raw
        })
    } catch (error) {
        next(error)
    }
}

module.exports.deleteUser = async (req, res, next) => {
    const { userId } = req.params

    try {
        const raw = await User.deleteOne({
            _id: userId,
            role: {
                $ne: 'admin'
            }
        })

        return res.json({
            message: "Delete user successfully!",
            raw
        })
    } catch (error) {
        next(error)
    }
}

/**
 * 
 * @param {string} fields 
 */
const selectFieldsShow = fields => {
    if (fields) {
        return fields.split(',').join(' ').replace('password', '')
    } else {
        return '-password'
    }
}

module.exports.getUser = async (req, res, next) => {
    const { userId } = req.params
    let { fields } = req.query

    try {
        const foundUser = await User.findById(userId)
            .select(selectFieldsShow(fields))

        if (!foundUser) throw "User is not exist"

        return res.json({
            user: foundUser
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Get user by email
 * @param {string} email 
 * @param {string} fields 
 */
module.exports.getByEmail = async (req, res, next) => {
    const { email } = req.params
    const { fields } = req.query

    try {
        const emailFormated = email.trim().toLowerCase()

        const foundUser = await User
            .findOne({
                email: emailFormated
            }).select(selectFieldsShow(fields))

        if (!foundUser) throw "Can not find user with email"

        return res.json({
            user: foundUser
        })
    } catch (error) {
        next(error)
    }
}

module.exports.getUsers = async (req, res, next) => {
    let { fields } = req.query

    try {
        let foundUsers = await User.find().select("name email createdAt")

        if (!foundUsers) throw "Can not show list of users"

        if (fields) {
            foundUsers = foundUsers.select(selectFieldsShow(fields))
        }

        return res.json({
            users: foundUsers
        })
    } catch (error) {
        next(error)
    }
}

module.exports.changeUserRole = async (req, res, next) => {
    let { userId } = req.params
    let { role } = req.query
    try {
        const user = await User.findByIdAndUpdate(userId, {
            role
        }, {
            new: true
        }).select('name role')

        if (!user) throw 'Can not find user with this Id'

        return res.json({
            message: `${user.name} is now ${role}`,
            user
        })
    } catch (error) {
        next(error)
    }
}