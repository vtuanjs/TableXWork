const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const ColumnSchema = new Schema(
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

ColumnSchema.pre("deleteOne", async function(next) {
  const _id = this.getQuery()["_id"];
  try {
    const cells = await mongoose.model("Cell").find({
      column: _id
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

const Column = mongoose.model("Column", ColumnSchema);
module.exports = Column;
