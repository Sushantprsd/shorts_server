const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReplyLikeSchema = new Schema(
    {
        verifiedLike:{
            type:Boolean,
            default:false
        },
        replyId: {
            type: Schema.Types.ObjectId,
            ref: "Reply",
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

ReplyLikeSchema.index({ replyId: 1, userId: 1 }, { unique: true }, { index: true });



module.exports = mongoose.model("ReplyLike", ReplyLikeSchema);