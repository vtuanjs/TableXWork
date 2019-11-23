const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const CellSchema = new Schema(
  {
    body: String,
    description: String,
    status: {
      type: String, //pending, uncompleted, completed,
      default: "pending"
    },
    author: {
      type: ObjectId,
      ref: "User"
    },
    attachFiles: [
      {
        type: String
      }
    ],
    row: {
      type: ObjectId,
      ref: "Row"
    },
    column: {
      type: ObjectId,
      ref: "Column"
    },
    table: {
      type: ObjectId,
      ref: "Table"
    }
  },
  {
    timestamps: true,
    autoIndex: true
  }
);

CellSchema.pre("deleteOne", function(next) {
  const _id = this.getQuery()["_id"];
  mongoose.model("User").updateMany(
    {
      "cells._id": _id
    },
    {
      $pull: {
        cells: {
          _id: _id
        }
      }
    },
    function(err, result) {
      if (err) {
        next(err);
      } else {
        next();
      }
    }
  );
});

CellSchema.pre("deleteMany", async function(next) {
  const cellIds = this.getQuery()._id.$in;

  if (cellIds.length >= 0) {
    mongoose.model("User").updateMany(
      {},
      {
        $pull: {
          cells: {
            _id: {
              $in: cellIds
            }
          }
        }
      },
      function(err, result) {
        if (err) {
          next(err);
        } else {
          next();
        }
      }
    );
  }
});

const Cell = mongoose.model("Cell", CellSchema);

module.exports = Cell;
