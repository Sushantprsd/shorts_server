const Comment = require("../model/Comment");
const VideoLike = require("../model/VideoLike");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VideoSchema = new Schema(
    {
        public: {
            videoUrl: {
                type: String,
                unique:true,
                required: true,
            },
            location: {
                type: { type: String },
                coordinates:[Number],
            },
            description: {
                type: String,
            },
        },
        status: {
            type: String,
            default: "onLine",
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            index:true,
            require: true,
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

VideoSchema.statics.deleteAllComments = function (videoId) {
    return Comment.find({ videoId: videoId })
        .select("_id")
        .then((comments) => {
            comments.map((key) => {
                return Comment.deleteComment(key._id);
            });
        })
        .catch((err) => {
            return err;
        });
};

VideoSchema.statics.deleteVideo = function (videoId) {
    return this.deleteOne({ _id: videoId })
        .then(() => {
            return VideoLike.deleteMany({ videoId: videoId });
        })
        .then(() => {
            return this.deleteAllComments(videoId);
        })
        .then(() => {
            return "Success";
        })
        .catch((err) => {
            return err;
        });
};

module.exports = mongoose.model("Video", VideoSchema);

// VideoSchema.methods.toggleAddLike = async function (userId) {
//     let updatedLikeUserIds = [...this.public.likes.likeUserIds];
//     // const findUserId = this.public.likes.likeUserIds.findIndex((id) => {
//     //     return id.toString() === userId.toString();
//     // });
//     // if (findUserId >= 0) {
//     //     updatedLikeUserIds = updatedLikeUserIds.filter((ids) => {
//     //         return ids.toString() !== userId.toString();
//     //     });
//     //     this.public.likes.likesNumbers = this.public.likes.likesNumbers - 1;
//     //     this.public.likes.likeUserIds = updatedLikeUserIds;
//     //     return this.save();
//     // }
// //     this.public.likes.likesNumbers = this.public.likes.likesNumbers + 1;
// //     updatedLikeUserIds.push(userId);
// //     this.public.likes.likeUserIds = updatedLikeUserIds;
// //     return await this.save();
// // };
