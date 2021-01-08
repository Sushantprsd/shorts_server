const ReplyLike = require("./ReplyLike");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReplySchema = new Schema(
    {
        public: {
            description: {
                type: String,
                require: true,
            },
            verifiedReply: {
                type: Boolean,
                default: false,
            },
        },
        commentId: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
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

ReplySchema.statics.deleteReply = function (replyId) {
    return this.deleteOne({ _id: replyId })
        .then(() => {
            return ReplyLike.deleteMany({ replyId: replyId });
        })
        .catch((err) => {
            return err;
        });
};

module.exports = mongoose.model("Reply", ReplySchema);
