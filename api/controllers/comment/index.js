const Comment = require('./comment.model')
const redis = require('../../helpers/redis')

module.exports.postComment = async (req, res, next) => {
    const { body } = req.body
    const { cellId } = req.params
    const signedInUser = req.user
    try {
        const comment = await Comment.create({
            body,
            commentOn: cellId,
            author: signedInUser._id
        })

        return res.json({ message: `Create comment successfully!`, comment })
    } catch (error) {
        next(error)
    }
}

module.exports.deleteComment = async (req, res, next) => {
    const { commentId } = req.params
    const signedInUser = req.user
    try {
        const raw = await Comment.deleteOne({
            _id: commentId,
            author: signedInUser._id
        })

        if (!raw.ok) {
            throw 'Can not delete this comment'
        }

        redis.del(commentId)

        return res.json({ message: "Delete comment successfully!", raw })
    } catch (error) {
        next(error)
    }
}

module.exports.updateComment = async (req, res, next) => {
    const { commentId } = req.params
    const { body } = req.body
    const signedInUser = req.user
    try {
        let comment = await Comment.findOne({
            _id: commentId,
            author: signedInUser._id
        })

        if (!comment) {
            throw 'Comment not exitsts or you do not permistion'
        }

        comment.edited.push({
            body: comment.body,
            createdAt: comment.updatedAt
        })
        comment.body = body

        await Promise.all([
            comment.save(),
            redis.setex(commentId, 3600, JSON.stringify(comment))
        ])

        return res.json({ message: `Update comment successfully!`, comment })
    } catch (error) {
        next(error)
    }
}

module.exports.getComments = async (req, res, next) => {
    const { cellId } = req.params

    try {
        const comments = await Comment.find({
            commentOn: cellId
        }, "body commentOn createdAt")
            .populate('author', 'name')

        if (!comments) throw "Can not show comment"

        return res.json({ comments })
    } catch (error) {
        next(error)
    }
}

module.exports.getComment = async (req, res, next) => {
    const { commentId } = req.params
    try {
        const store = await redis.get(commentId)

        if (store) {
            return res.json({ comment: JSON.parse(store) })
        } else {
            const comment = await Comment.findById(commentId)
                .populate('author', 'name')

            if (!comment) throw "Wrong comment id"

            redis.setex(commentId, 3600, JSON.stringify(comment))

            return res.json({ comment })
        }
    } catch (error) {
        next(error)
    }
}