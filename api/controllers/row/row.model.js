const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const RowSchema = new Schema(
  {
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
    }
  },
  {
    timestamps: true,
    autoCreate: true
  }
);

RowSchema.pre("deleteOne", async function(next) {
  const _id = this.getQuery()["_id"];

  try {
    const cells = await mongoose.model("Cell").find({
      row: _id
    });

    if (cells.length > 0) {
      const cellIds = cells.map(cell => cell._id);

      await mongoose.model("Cell").deleteMany({
        _id: {
          $in: cellIds
        }
      });
    }

    next();
  } catch (error) {
    next(error);
  }
});

RowSchema.pre("deleteMany", async function(next) {
  const tableId = this.getQuery().table;
  try {
    const cells = await mongoose.model("Cell").find({
      table: tableId
    });
    if (cells.length > 0) {
      const cellIds = cells.map(cell => cell._id);

      await mongoose.model("Cell").deleteMany({
        _id: {
          $in: cellIds
        }
      });
    }

    next();
  } catch (error) {
    next(error);
  }
});

const Row = mongoose.model("Row", RowSchema);
module.exports = Row;
