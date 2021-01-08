var mongoose = require("mongoose");
const util = require("util");
const fileHelper = require("../util/file");
const User = require("../model/User");
const Video = require("../model/Video");
const Comment = require("../model/Comment");
const Reply = require("../model/Reply");
const VideoLike = require("../model/VideoLike");
const CommentLike = require("../model/CommentLike");
const ReplyLike = require("../model/ReplyLike");

const profileBucket = process.env.AWS_PROFILE_PICTURE;
const videoBucket = process.env.AWS_VIDEO;
exports.postDisplayPicture = (req, res, next) => {
    if (!req.file) {
        const error = new Error("No image uploaded.");
        error.statusCode = 404;
        throw error;
    }
    let imageUrl = null;
    const user = req.user;
    let prevImageUrl = null;
    if (user.public.displayPicture.imageUrl) {
        prevImageUrl = user.public.displayPicture.imageUrl;
    }
    imageUrl = req.file.location;
    user.public.displayPicture.imageUrl = imageUrl;
    user.save()
        .then((user) => {
            if (prevImageUrl) {
                let prevImageKey = prevImageUrl.split("/").pop();
                fileHelper.deleteFile(profileBucket, prevImageKey);
            }
            return res.status(200).json({
                data: user.public.displayPicture.imageUrl,
            });
        })
        .catch((err) => {
            if (imageUrl) {
                let prevImageKey = imageUrl.split("/").pop();
                fileHelper.deleteFile(profileBucket, prevImageKey);
            }
            if (!err.statusCode) {
                err.statusCode = 500;
                next(err);
            }
            next(err);
        });
};

exports.postNewVideo = (req, res, next) => {
    if (!req.file) {
        const error = new Error("No video uploaded.");
        error.statusCode = 404;
        throw error;
    }
    let videoUrl = null;
    videoUrl = req.file.location;
    const newVideo = new Video({
        public: { videoUrl: videoUrl },
        userId: req.userId,
    });
    try {
        if (req.body.coordinates) {
            newVideo.public.location.type = "Point";
            newVideo.public.location.coordinates = req.body.coordinates;
        }
        if (req.body.description) {
            newVideo.public.description = req.body.description;
        }
    } catch (err) {
        if (videoUrl) {
            let videoKey = videoUrl.split("/").pop();
            fileHelper.deleteFile(videoBucket, videoKey);
        }
        err.statusCode = 404;
        throw err;
    }
    newVideo
        .save()
        .then((newVideo) => {
            return res.status(201).json({
                message: "Post Created",
                data: newVideo,
            });
        })
        .catch((err) => {
            if (videoUrl) {
                let videoKey = videoUrl.split("/").pop();
                fileHelper.deleteFile(videoBucket, videoKey);
            }
            if (!err.statusCode) {
                err.statusCode = 500;
                next(err);
            }
            next(err);
        });
};

exports.postToggleLikeVideo = (req, res, next) => {
    const videoId = req.params.videoId;
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        const error = new Error("Video Doesn't Exist");
        error.statusCode = 404;
        throw error;
    }
    Video.findById(videoId, { _id: 1 })
        .then((video) => {
            if (!video) {
                const error = new Error("Video Doesn't Exist");
                error.statusCode = 404;
                throw error;
            }
            return VideoLike.findOne({ videoId: videoId, userId: req.userId }, { _id: 1 });
        })
        .then((like) => {
            if (like) {
                return VideoLike.deleteOne({ _id: like._id });
            }
            const newLike = new VideoLike({
                videoId: videoId,
                userId: req.userId,
            });
            if (req.user.public.verified) {
                newLike.verifiedLike = true;
            }
            return newLike.save();
        })
        .then((newLike) => {
            if (newLike._id) {
                return res.status(201).json({
                    message: "video liked",
                });
            }
            return res.status(204).json({
                message: "video unliked",
            });
        })
        .catch((err) => {
            console.log(err);
            if (!err.statusCode) {
                err.statusCode = 500;
                next(err);
            }
            next(err);
        });
};

exports.postAddComment = (req, res, next) => {
    const videoId = req.params.videoId;
    const description = req.body.description;
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        const error = new Error("Video Doesn't Exist");
        error.statusCode = 404;
        throw error;
    }
    Video.findById(videoId, { _id: 1 })
        .then((video) => {
            if (!video) {
                const error = new Error("Video Doesn't Exist");
                error.statusCode = 404;
                throw error;
            }
            const comment = new Comment({
                public: {
                    description: description,
                },
                videoId: videoId,
                userId: req.userId,
            });
            if (req.user.public.verified) {
                comment.public.verifiedComment = true;
            }
            // for(let i=0;i<100000;i++){
            //     let com = new Comment({
            //         public: {
            //             description: description,
            //         },
            //         videoId: videoId,
            //         userId: req.userId,
            //     })
            //     com.save();

            // }
            return comment.save();
        })
        .then((comment) => {
            return res.status(201).json({
                message: "Commented on video",
                data: comment,
            });
        })
        .catch((err) => {
            console.log(err);
            if (!err.statusCode) {
                err.statusCode = 500;
                next(err);
            }
            next(err);
        });
};

exports.postToggleLikeComment = (req, res, next) => {
    const commentId = req.params.commentId;
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        const error = new Error("Comment Doesn't Exist");
        error.statusCode = 404;
        throw error;
    }
    Comment.findById(commentId, { _id: 1 })
        .then((comment) => {
            if (!comment) {
                const error = new Error("Comment doesn't exist");
                error.statusCode = 404;
                throw error;
            }
            return CommentLike.findOne({ userId: req.userId, commentId: commentId });
        })
        .then((like) => {
            if (like) {
                return CommentLike.deleteOne({ _id: like._id });
            }
            const newCommentLike = new CommentLike({
                commentId: commentId,
                userId: req.userId,
            });
            if (req.user.public.verified) {
                newCommentLike.verifiedLike = true;
            }
            return newCommentLike.save();
        })
        .then((commentLiked) => {
            if (commentLiked._id) {
                return res.status(201).json({
                    message: "Comment liked",
                });
            }
            return res.status(204).json({
                message: "Comment unliked",
            });
        })
        .catch((err) => {
            console.log(err);
            if (!err.statusCode) {
                err.statusCode = 500;
                next(err);
            }
            next(err);
        });
};

exports.postAddReply = (req, res, next) => {
    const commentId = req.params.commentId;
    const description = req.body.description;
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        const error = new Error("Comment Doesn't Exist");
        error.statusCode = 404;
        throw error;
    }
    Comment.findById(commentId,{_id:1})
        .then((comment) => {
            if (!comment) {
                const error = new Error("Comment doesn't exist");
                error.statusCode = 404;
                throw error;
            }
            const reply = new Reply({
                public: {
                    description: description,
                },
                commentId: commentId,
                userId: req.userId,
            });
            if (req.user.public.verified) {
                reply.public.verifiedReply = true;
            }
            return reply.save();
        })
        .then((reply) => {
            return res.status(201).json({
                message: "replied on video",
                data: reply,
            });
        })
        .catch((err) => {
            console.log(err);
            if (!err.statusCode) {
                err.statusCode = 500;
                next(err);
            }
            next(err);
        });
};

exports.postToggleLikeReply = (req, res, next) => {
    const replyId = req.params.replyId;
    if (!mongoose.Types.ObjectId.isValid(replyId)) {
        const error = new Error("Reply Doesn't Exist");
        error.statusCode = 404;
        throw error;
    }
    Reply.findById(replyId,{_id:1})
        .then((reply) => {
            if (!reply) {
                const error = new Error("Reply doesn't exist");
                error.statusCode = 404;
                throw error;
            }
            return ReplyLike.findOne({ replyId: replyId,userId: req.userId },{_id:1});
        })
        .then((like) => {
            if (like) {
                return ReplyLike.deleteOne({ _id: like._id });
            }
            const newReplyLike = new ReplyLike({
                replyId: replyId,
                userId: req.userId,
            });
            if (req.user.public.verified) {
                newReplyLike.verifiedLike = true;
            }
            return newReplyLike.save();
        })
        .then((ReplyLike) => {
            if (ReplyLike._id) {
                return res.status(201).json({
                    message: "Reply liked",
                });
            }
            return res.status(204).json({
                message: "Reply unliked",
            });
        })
        .catch((err) => {
            console.log(err);
            if (!err.statusCode) {
                err.statusCode = 500;
                next(err);
            }
            next(err);
        });
};

exports.postDeleteVideo = (req, res, next) => {
    const videoId = req.params.videoId;
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        const error = new Error("Video Doesn't Exist");
        error.statusCode = 404;
        throw error;
    }
    Video.findById(videoId,{_id:1,userId:1,public:1})
        .then((video) => {
            if (!video) {
                const error = new Error("Video Doesn't Exist");
                error.statusCode = 404;
                throw error;
            }
            if (video.userId.toString() !== req.userId.toString()) {
                const error = new Error("Not Authorized");
                error.statusCode = 401;
                throw error;
            }
            let videoKey = video.public.videoUrl.split("/").pop();
            fileHelper.deleteFile(videoBucket, videoKey);
            return Video.deleteVideo(videoId);
        })
        .then((data) => {
            return res.status(204).json({
                message: "Media Deleted",
            });
        })
        .catch((err) => {
            console.log(err);
            if (!err.statusCode) {
                err.statusCode = 500;
                next(err);
            }
            next(err);
        });
};

exports.postDeleteComment = (req, res, next) => {
    const commentId = req.params.commentId;
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        const error = new Error("Comment Doesn't Exist");
        error.statusCode = 404;
        throw error;
    }
    Comment.findById(commentId,{userId:1})
        .then((comment) => {
            if (!comment) {
                const error = new Error("Comment doesn't exist");
                error.statusCode = 404;
                throw error;
            }
            if (comment.userId.toString() !== req.userId.toString()) {
                const error = new Error("Not Authorized");
                error.statusCode = 401;
                throw error;
            }
            return Comment.deleteComment(commentId);
        })
        .then(() => {
            return res.status(204).json({
                message: "Comment deleted",
            });
        })
        .catch((err) => {
            console.log(err);
            if (!err.statusCode) {
                err.statusCode = 500;
                next(err);
            }
            next(err);
        });
};

exports.postDeleteReply = (req, res, next) => {
    const replyId = req.params.replyId;
    if (!mongoose.Types.ObjectId.isValid(replyId)) {
        const error = new Error("Reply Doesn't Exist");
        error.statusCode = 404;
        throw error;
    }
    Reply.findById(replyId,{userId:1})
        .then((reply) => {
            if (!reply) {
                const error = new Error("Reply doesn't exist");
                error.statusCode = 404;
                throw error;
            }
            if (reply.userId.toString() !== req.userId.toString()) {
                const error = new Error("Not Authorized");
                error.statusCode = 401;
                throw error;
            }
            return Reply.deleteReply(replyId);
        })
        .then(() => {
            return res.status(204).json({
                message: "Reply deleted",
            });
        })
        .catch((err) => {
            console.log(err);
            if (!err.statusCode) {
                err.statusCode = 500;
                next(err);
            }
            next(err);
        });
};
