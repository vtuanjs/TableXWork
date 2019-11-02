const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

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

RowSchema.pre('deleteOne', function (next) {
    const _id = this.getQuery()["_id"]
    mongoose.model("User").updateMany({
        'rows._id': _id
    }, {
        $pull: {
            rows: {
                _id
            }
        }
    }, function (err, result) {
        if (err) {
            next(err)
        } else {
            next()
        }
    })
})

const Row = mongoose.model("Row", RowSchema)
module.exports = Row