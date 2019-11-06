const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const RowSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    author: {
        type: ObjectId,
        ref: "User"
    },
    table: {
        type: ObjectId,
        ref: "Table"
    },
}, {
    timestamps: true,
    autoCreate: true
})

const Row = mongoose.model("Row", RowSchema)
module.exports = Row