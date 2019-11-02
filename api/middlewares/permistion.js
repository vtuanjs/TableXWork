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

    if (roles.indexOf("user") > -1) {
        roles += ' admin owner'
    }

    return roles
}

/**
 * Check roles
 * @param {*} param0 
 */
const shouldIsAllowed = ({user, models, id, roles}) => {
    roles = addAdminRole(roles)

    return user[models] && user[models].some(item => {
        return item._id.equals(id) && isAllowed(item.role, roles)
    })
}

const isInUser = ({ user, roles }) => {
    roles = addAdminRole(roles)

    if (isAllowed(user.role, roles)) {
        return true
    }
    return false
}

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

// const isInTeam = (allowed, source) => {
//     return (req) => {
//         const signedInUser = req.user
//         let teamId = findParameterFromSource('teamId', source)(req)

//         if (teamId) {
//             if (shouldIsAllowed({
//                 user: signedInUser,
//                 propertyInUser: 'teams',
//                 propertyIdCheck: teamId,
//                 allowed
//             })) {
//                 return true
//             }
//         }

//         return false
//     }
// }

/**
 * Check permit from array object. 
 * 
 * {user, modelCheck, roles, id}, {user, modelCheck, roles, id}
 * @param {*} as {user, modelCheck, roles, id}
 */
module.exports = checkPermit = (...checks) => {
    let isAccess = false

    for (let i = 0; i < checks.length; i++) {
        const {
            user,
            modelCheck,
            roles,
            id
        } = checks[i]
        switch (modelCheck) {
            case 'user':
                if (isInUser({ user, roles })) {
                    isAccess = true
                }
                break
            case 'table':
                if (isInTable({ user, roles, tableId: id })) {
                    isAccess = true
                }
                break
            // case 'job':
            //     if (isInJob(roles, source)(req)) return next()
            // case 'team':
            //     if (isInTeam(roles, source)(req)) return next()
            default:
                break
        }
    }

    return (_req, res, next) => {
        if (isAccess) {
            return next()
        } else {
            return res.status(403).json({
                message: 'You do not permistion do this action'
            })
        }
    }

}