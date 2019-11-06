const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const CellSchema = new Schema({
    body: String,
    description: String,
    status: {
        type: String, //pending, uncompleted, completed,
        default: 'pending'
    },
    author: {
        type: ObjectId,
        ref: 'User'
    },
    attachFiles: [
        {
            type: String,
        }
    ],
    row: {
        type: ObjectId,
        ref: 'Row'
    },
    column: {
        type: ObjectId,
        ref: 'Column'
    },
    table: {
        type: ObjectId,
        ref: 'Table'
    }
}, {
    timestamps: true,
    autoIndex: true
})

const Cell = mongoose.model('Cell', CellSchema)

module.exports = Cell