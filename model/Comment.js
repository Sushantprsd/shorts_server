const CommentLike = require("./CommentLike");
const Reply = require("./Reply");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema(
    {
        public: {
            description: {
                type: String,
                require: true,
            },
            verifiedComment: {
                type: Boolean,
                default: false,
            },
        },
        videoId: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            index:true,
            require: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            require: true,
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

CommentSchema.statics.deleteAllReplies = function (commentId) {
    return Reply.find({ commentId: commentId })
        .select("_id")
        .then((replies) => {
            replies.map((key) => {
                return Reply.deleteReply(key._id);
            });
        })
        .catch((err) => {
            return err;
        });
};

CommentSchema.statics.deleteComment = function (commentId) {
    return this.deleteOne({ _id: commentId })
        .then(() => {
            return CommentLike.deleteMany({ commentId: commentId });
        })
        .then(() => {
            return this.deleteAllReplies(commentId);
        })
        .then(() => {
            return "Success";
        })
        .catch((err) => {
            return err;
        });
};

module.exports = mongoose.model("Comment", CommentSchema);

