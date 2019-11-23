const Row = require("./row.model");
const redis = require("../../helpers/redis");
const redisLife = parseInt(process.env.REDIS_QUERY_LIFE);

module.exports.postRow = async (req, res, next) => {
  const { title, description } = req.body;
  const { tableId } = req.params;
  const signedInUser = req.user;
  try {
    const row = await Row.create({
      title,
      description,
      author: signedInUser._id,
      table: tableId
    });

    return res.json({
      message: `Create row successfully!`,
      row
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getRows = async (req, res, next) => {
  const { fields } = req.query;
  const { tableId } = req.params;

  const selectFields = selectFieldsShow(fields);
  try {
    const rows = await Row.find({
      table: tableId
    }).select(selectFields);

    return res.json({
      rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Format query select fields
 * @param {string} fields
 */
const selectFieldsShow = fields => {
  if (fields) {
    return fields.split(",").join(" ");
  }

  return "";
};

module.exports.getRow = async (req, res, next) => {
  const { rowId, tableId } = req.params;
  const { fields } = req.query;

  const selectFields = selectFieldsShow(fields);
  try {
    const store = await redis.get(rowId);

    if (store) {
      res.json({ row: JSON.parse(store) });
    } else {
      const row = await Row.findOne({
        _id: rowId,
        table: tableId
      }).select(selectFields);

      if (!row) throw "Wrong row id";

      await redis.setex(rowId, redisLife, JSON.stringify(row));

      return res.json({
        row
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports.deleteRow = async (req, res, next) => {
  const { rowId, tableId } = req.params;

  try {
    const raw = await Row.deleteOne({
      _id: rowId,
      table: tableId
    });

    await redis.del(rowId);

    return res.json({
      message: "Delete row successfully!",
      raw
    });
  } catch (error) {
    next(error);
  }
};

module.exports.updateRow = async (req, res, next) => {
  const { rowId, tableId } = req.params;
  const { title, description } = req.body;
  try {
    const row = await Row.findOneAndUpdate(
      {
        _id: rowId,
        table: tableId
      },
      {
        ...(title && { title }),
        ...(description && { description })
      },
      {
        new: true
      }
    );

    if (!row) throw "Can not find row with this ID";

    await redis.setex(rowId, redisLife, JSON.stringify(row));

    return res.json({
      message: `Update row successfully!`,
      row
    });
  } catch (error) {
    next(error);
  }
};
