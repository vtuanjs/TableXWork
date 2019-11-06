/**
 * Check roles is allowed?
 * @param {string} roleCheck
 * @param {string} rolesAllowed
 */
const isAllowed = (roleCheck, rolesAllowed) => {
    return rolesAllowed.indexOf(roleCheck) > -1
}

/**
 * Auto add admin, owner roles 
 * @param {string} allowed 
 */
const addAdminRole = (roles) => {
    if (roles.indexOf("admin") > -1) {
        roles += ' owner'
    }

    if (roles.indexOf("mod") > -1) {
        roles += ' admin owner'
    }

    if (roles.indexOf("user") > -1) {
        roles += ' mod admin owner'
    }

    return roles
}

/**
 * Check roles
 * @param {*} param0 
 */
const shouldIsAllowed = ({ user, models, id, roles }) => {
    roles = addAdminRole(roles)

    return user[models] && user[models].some(item => {
        return item._id.equals(id) && isAllowed(item.role, roles)
    })
}

/**
 * Check permistion in user
 * @param {*} as { user, roles } 
 */
const isInUser = ({ user, roles }) => {
    roles = addAdminRole(roles)

    if (isAllowed(user.role, roles)) {
        return true
    }
    return false
}

/**
 * Check permistion in table
 * @param {*} as { user, roles, tableId } 
 */
const isInTable = ({ user, roles, tableId }) => {
    if (tableId) {
        if (shouldIsAllowed({
            user,
            models: 'tables',
            id: tableId,
            roles
        })) {
            return true
        }
    }

    return false
}

/**
 * Check permistion in cell
 * @param {*} as { user, roles, tableId } 
 */
const isInCell = ({ user, roles, cellId }) => {
    if (cellId) {
        if (shouldIsAllowed({
            user,
            models: 'cells',
            id: cellId,
            roles
        })) {
            return true
        }
    }

    return false
}

const isInTeam = ({ user, roles, teamId }) => {
    if (teamId) {
        if (shouldIsAllowed({
            user,
            models: 'teams',
            id: teamId,
            roles
        })) {
            return true
        }
    }

    return false
}

/**
 * Check permit from array object. 
 * 
 * {model, roles}, {model, roles}
 * @param {*} as {model, roles}
 */
module.exports = checkPermit = (...checks) => {

    return (req, res, next) => {
        let isAccess = false
        const user = req.user

        for (let i = 0; i < checks.length; i++) {
            const { model, roles } = checks[i]

            switch (model) {
                case 'user':
                    if (isInUser({ user, roles })) {
                        isAccess = true
                    }
                    break
                case 'table':
                    const tableId = req.params.tableId
                    if (isInTable({ user, roles, tableId })) {
                        isAccess = true
                    }
                    break
                case 'team':
                    const teamId = req.params.teamId
                    if (isInTeam({ user, roles, teamId })) {
                        isAccess = true
                    }
                case 'cell':
                    const cellId = req.params.cellId
                    if (isInCell({ user, roles, cellId })) {
                        isAccess = true
                    }
                    break
                default:
                    break
            }
        }

        if (isAccess) {
            return next()
        } else {
            return res.status(403).json({
                message: 'You do not permistion do this action'
            })
        }
    }

}