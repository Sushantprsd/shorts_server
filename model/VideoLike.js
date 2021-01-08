const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VideoLikeSchema = new Schema(
    {
        verifiedLike:{
            type:Boolean,
            default:false
        },
        videoId: {
            type: Schema.Types.ObjectId,
            ref: "Video",
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

VideoLikeSchema.index({videoId: 1, userId: 1}, {unique: true}, {index:true})

module.exports = mongoose.model("VideoLike", VideoLikeSchema);

// VideoLikeSchema.methods.toggleAddLike = function (userId) {
//     let updatedLikeUserIds = [...this.public.likes.likeUserIds];
//     const findUserId = this.public.likes.likeUserIds.findIndex((id) => {
//         return id.toString() === userId.toString();
//     });
//     if (findUserId >= 0) {
//         updatedLikeUserIds = updatedLikeUserIds.filter((ids) => {
//             return ids.toString() !== userId.toString();
//         });
//         this.public.likes.likesNumbers = this.public.likes.likesNumbers - 1;
//         this.public.likes.likeUserIds = updatedLikeUserIds;
//         return this.save();
//     }
//     this.public.likes.likesNumbers = this.public.likes.likesNumbers + 1;
//     updatedLikeUserIds.push(userId);
//     this.public.likes.likeUserIds = updatedLikeUserIds;
//     return this.save();
// };