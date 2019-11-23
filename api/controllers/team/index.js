const Team = require("./team.model");
const User = require("../user/user.model");
const Notify = require("../notify/notify.model");
const INVITE_JOIN_TEAM = "Invite Join Team";
const mongoose = require("mongoose");

module.exports.postTeam = async (req, res, next) => {
  const signedInUser = req.user;
  const { name, description } = req.body;
  try {
    const team = await Team.create({
      name,
      description,
      author: signedInUser._id
    });

    await User.findByIdAndUpdate(signedInUser._id, {
      $addToSet: {
        teams: {
          _id: team._id,
          role: "owner",
          isJoined: 1
        }
      }
    });

    return res.json({
      message: `Create team: ${team.name} successfully!`,
      team
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getTeams = async (req, res, next) => {
  const { fields } = req.query;

  try {
    const teams = await Team.find().select(selectFieldsShow(fields));

    return res.json({
      message: `Get list teams succesfully!`,
      teams
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

module.exports.getTeamsByUser = async (req, res, next) => {
  const signedInUser = req.user;
  const { fields } = req.query;

  try {
    const arrayTeamIdsOfUser = signedInUser.teams.map(team => {
      return team._id;
    });
    const teams = await Team.find({
      _id: {
        $in: arrayTeamIdsOfUser
      }
    }).select(selectFieldsShow(fields));

    if (teams.length === 0) {
      throw "Can not find any team";
    }

    return res.json({
      message: `Get list teams succesfully!`,
      teams
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getDetail = async (req, res, next) => {
  const { teamId } = req.params;
  const { fields } = req.query;

  try {
    const [team, members] = await Promise.all([
      Team.findOne({
        _id: teamId
      }).populate(selectFieldsShow(fields)),

      User.find({ "teams._id": teamId }).select("name")
    ]);

    if (!team) {
      throw "Can not find any team";
    }

    return res.json({
      message: `Get list teams succesfully!`,
      team: {
        detail: team,
        members
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports.updateTeam = async (req, res, next) => {
  const { teamId } = req.params;
  const { name, description } = req.body;
  try {
    const team = await Team.findByIdAndUpdate(
      teamId,
      {
        ...(name && { name }),
        ...(description && { description })
      },
      {
        new: true
      }
    );

    if (!team) {
      throw "Can not find this team";
    }

    return res.json({
      message: `Update team successfully!`,
      team
    });
  } catch (error) {
    next(error);
  }
};

module.exports.deleteTeam = async (req, res, next) => {
  const { teamId } = req.params;

  try {
    const raw = await Team.deleteOne({
      _id: teamId
    });

    return res.json({
      message: "Delete team successfully!",
      raw
    });
  } catch (error) {
    next(error);
  }
};

module.exports.addMembers = async (req, res, next) => {
  const { userIds } = req.body;
  const { teamId } = req.params;
  const signedInUser = req.user;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // Verify team and users will add to team
      const [team, verifyUserIds] = await Promise.all([
        Team.findById(teamId),
        getVerifyUserIds(userIds)
      ]);

      if (verifyUserIds.length === 0) throw 'Can not find any user"';

      if (
        !isAllowed({
          team,
          idCheck: teamId,
          userCheck: signedInUser
        })
      ) {
        throw "Member can not add member";
      }

      await Promise.all([
        addRefTeamToUsers({
          teamId,
          userIds: verifyUserIds,
          session
        }),
        createNotifyJoinTeam({
          message: `${signedInUser.name} invite you join team ${team.title}`,
          teamId,
          userIds: verifyUserIds,
          session
        })
      ]);

      return res.json({
        message: `Add member successfully!`
      });
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check input value. If it's a string, convert it to an array
 * @param {string | array} userIds
 */
const splitUserIds = userIds => {
  if (typeof userIds === "string") {
    return userIds.split(",").map(item => {
      return item.trim();
    });
  } else {
    return userIds;
  }
};

/**
 * Return new verified userIds
 * @param {*} userIds
 */
const getVerifyUserIds = userIds => {
  return new Promise((resole, reject) => {
    return User.find(
      {
        _id: {
          $in: splitUserIds(userIds)
        }
      },
      (error, users) => {
        if (error) {
          return reject(error);
        }

        return resole(users.map(user => user._id));
      }
    );
  });
};

/**
 * Save id team to all members
 * @param {*} as teamId, userIds, session
 */
const addRefTeamToUsers = ({ teamId, userIds, session }) => {
  return User.updateMany(
    {
      _id: {
        $in: userIds
      },
      "teams._id": {
        $ne: teamId
      }
    },
    {
      $push: {
        teams: {
          _id: teamId,
          role: "user",
          isJoined: 0
        }
      }
    }
  ).session(session);
};

/**
 * Notify to all users join team
 * @param {*} as message, teamId, userIds, session
 */
const createNotifyJoinTeam = ({ message, teamId, userIds, session }) => {
  let arrayNotifyCreate = [];
  const userIdsLength = userIds.length;
  for (let index = 0; index < userIdsLength; index++) {
    arrayNotifyCreate.push({
      title: INVITE_JOIN_TEAM,
      message: message,
      secretKey: {
        teamId
      },
      user: userIds[index]
    });
  }

  return Notify.create(arrayNotifyCreate, {
    session
  });
};

/**
 * If isAllowMemberAddMember = 0, normal user can not add new member to team
 * @param {*} as team, idCheck, userCheck
 */
const isAllowed = ({ team, idCheck, userCheck }) => {
  if (
    !team.allowed.isAllowMemberAddMember &&
    userCheck.teams.some(item => {
      return item._id.equals(idCheck) && item.role === "user";
    })
  ) {
    return false;
  }
  return true;
};

module.exports.agreeJoinTeam = async (req, res, next) => {
  const { teamId } = req.params;
  const signedInUser = req.user;
  try {
    await Promise.all([
      User.updateOne(
        {
          _id: signedInUser._id,
          "teams._id": teamId
        },
        {
          $set: {
            "teams.$.isJoined": 1
          }
        }
      ),

      Notify.updateOne(
        {
          user: signedInUser._id,
          title: INVITE_JOIN_TEAM,
          "secretKey.teamId": teamId
        },
        {
          $unset: {
            secretKey: {
              teamId
            }
          },
          isAction: 1
        }
      )
    ]);

    return res.json({
      message: "Join team successfully!"
    });
  } catch (error) {
    next(error);
  }
};

module.exports.disAgreeJoinTeam = async (req, res, next) => {
  const { teamId } = req.params;
  const signedInUser = req.user;
  try {
    await Promise.all([
      User.updateOne(
        {
          _id: signedInUser._id,
          "teams._id": teamId
        },
        {
          $pull: {
            teams: {
              _id: teamId
            }
          }
        }
      ),

      Notify.updateOne(
        {
          user: signedInUser._id,
          title: INVITE_JOIN_TEAM,
          "secretKey.teamId": teamId
        },
        {
          $unset: {
            secretKey: {
              teamId
            }
          },
          isAction: 1
        }
      )
    ]);

    return res.json({
      message: "Disagree join team successfully!"
    });
  } catch (error) {
    next(error);
  }
};

module.exports.removeMembers = async (req, res, next) => {
  const { userIds } = req.body;
  const { teamId } = req.params;
  try {
    await Promise.all([
      User.updateMany(
        {
          _id: {
            $in: splitUserIds(userIds)
          }
        },
        {
          $pull: {
            teams: {
              _id: teamId
            }
          }
        }
      )
    ]);

    return res.json({
      message: `Remove member successfully!`
    });
  } catch (error) {
    next(error);
  }
};

module.exports.leaveTeam = async (req, res, next) => {
  const { teamId } = req.params;
  const signedInUser = req.user;
  try {
    await User.updateOne(
      {
        _id: signedInUser._id
      },
      {
        $pull: {
          teams: {
            _id: teamId
          }
        }
      }
    );

    return res.json({
      message: `Leave table successfully!`
    });
  } catch (error) {
    next(error);
  }
};

const handleShowMembers = (members, teamId) => {
  return members.map(member => {
    const teams = member.teams.filter(team => {
      return team._id.equals(teamId);
    });

    return {
      _id: member._id,
      name: member._name,
      team: teams[0]
    };
  });
};

module.exports.showMembers = async (req, res, next) => {
  let { teamId } = req.params;
  try {
    const members = await User.find({ "teams._id": teamId });

    if (!members) {
      throw "Can not find any members";
    }

    return res.json({ members: handleShowMembers(members, teamId) });
  } catch (error) {
    next(error);
  }
};

module.exports.changeUserRole = async (req, res, next) => {
  const { teamId } = req.params;
  const { userId, role } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      {
        _id: userId
      },
      {
        $set: {
          "teams.$[element].role": role
        }
      },
      {
        arrayFilters: [
          {
            "element._id": teamId
          }
        ],
        new: true
      }
    );

    if (!user) throw "Can not find user or user not a member in team";

    return res.json({
      message: `${user.name} is now ${role}!`,
      user
    });
  } catch (error) {
    next(error);
  }
};
