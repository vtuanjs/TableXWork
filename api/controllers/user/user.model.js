"use strict";
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      lowercase: true,
      match: /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      unique: true,
      required: true
    },
    name: {
      type: String,
      default: ""
    },
    avata: String,
    gender: {
      type: String,
      enum: ["male", "female", "N/A"],
      default: "N/A"
    },
    phone: {
      type: String,
      default: "N/A"
    },
    address: {
      type: String,
      default: "N/A"
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: "user"
    }, //admin, mod, user
    score: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Number,
      default: 1
    },
    isBanned: {
      type: Number,
      default: 0
    }, //1: banned
    tables: [
      {
        _id: {
          type: ObjectId,
          ref: "Table"
        },
        role: {
          type: String,
          default: "user"
        },
        isJoined: {
          type: Number,
          default: 0
        }
      }
    ],
    cells: [
      {
        _id: {
          type: ObjectId,
          ref: "Cell"
        },
        role: {
          type: String,
          default: "user"
        }
      }
    ],
    teams: [
      {
        _id: {
          type: ObjectId,
          ref: "Team"
        },
        role: {
          type: String,
          default: "user"
        },
        isJoined: {
          type: Number,
          default: 0
        }
      }
    ],
    signedDevice: [
      {
        _id: false,
        ip: String,
        refreshTokenKey: String,
        signedAt: { type: Date, default: Date.now() },
        location: Object
      }
    ]
  },
  {
    timestamps: true,
    autoCreate: true
  }
);

UserSchema.pre("save", function(next) {
  const user = this;
  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  bcrypt.hash(user.password, 10, (error, encrypted) => {
    if (error) return next(error);
    user.password = encrypted;
    next();
  });
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
