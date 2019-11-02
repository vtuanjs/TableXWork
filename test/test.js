'use strict'
const User = require('../api/controllers/user/user.model')
const Table = require('../api/controllers/table/table.model')
const Row = require('../api/controllers/row/row.model')
const Notify = require('../api/controllers/notify/notify.model')
// const Comment = require('../api/controllers/comment/comment.model')
const Team = require('../api/controllers/team/team.model')

const database = require('../database')
const redis = require('../api/helpers/redis')

before(done => {
    console.log('Loading test...')
    database.connect().then(() => {
        if (process.env.NODE_ENV === 'dbtest'){
            Promise.all([
                User.remove(),
                Table.remove(),
                Row.remove(),
                Notify.remove(),
                // Comment.remove(),
                Team.remove(),
            ])
        }
        done()
    }).catch((error) => done(error));
})

after(() => {
    redis.flushall()
    console.log('Test completed')
})

require('../api/controllers/user/user.test')
require('../api/controllers/table/table.test')
// require('../api/controllers/row/row.test')
// require('../api/controllers/notify/notify.test')
// require('../api/controllers/comment/comment.test')
// require('../api/controllers/team/team.test')