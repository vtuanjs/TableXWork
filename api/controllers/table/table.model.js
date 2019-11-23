const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const TableSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: " "
    },
    isStored: {
      type: Number,
      default: 0
    },
    isDeleted: {
      type: Number,
      default: 0
    },
    allowed: {
      isAllowMemberAddMember: {
        type: Number,
        default: 1
      }
    },
    author: {
      type: ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true,
    autoCreate: true
  }
);

TableSchema.pre("deleteOne", function(next) {
  const _id = this.getQuery()["_id"];
  return Promise.all([
    mongoose.model("User").updateMany(
      {
        "tables._id": _id
      },
      {
        $pull: {
          tables: {
            _id: _id
          }
        }
      }
    ),
    mongoose.model("Row").deleteMany({
      table: _id
    }),
    mongoose.model("Column").deleteMany({
      table: _id
    })
  ])
    .then(() => {
      return next();
    })
    .catch(error => {
      return next(error);
    });
});

const Table = mongoose.model("Table", TableSchema);
module.exports = Table;
