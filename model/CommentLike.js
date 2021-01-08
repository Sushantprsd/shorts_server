const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentLikeSchema = new Schema(
    {
        verifiedLike: {
            type: Boolean,
            default: false,
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

CommentLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true }, { index: true });

module.exports = mongoose.model("CommentLike", CommentLikeSchema);
