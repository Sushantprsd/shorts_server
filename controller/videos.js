const mongoose = require("mongoose");
const Video = require("../model/Video");
const Comment = require("../model/Comment");
const Reply = require("../model/Reply");
const ObjectId = mongoose.Types.ObjectId;
// const CommentLike = require("../model/CommentLike");
// const User = require("../model/User");
// const VideoLike = require("../model/VideoLike");
// const ReplyLike = require("../model/ReplyLike");
// const { aggregate } = require("../model/CommentLike");

exports.getFetchAllVideos = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 10;
    Video.aggregate([
        { $skip: (currentPage - 1) * perPage },
        { $limit: perPage },
        { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "creator" } },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "videoId",
                as: "comments",
            },
        },
        {
            $lookup: {
                from: "videolikes",
                localField: "_id",
                foreignField: "videoId",
                as: "videoLikes",
            },
        },
        {
            $project: {
                _id: 1,
                public: 1,
                creator: 1,
                comments: { $cond: { if: { $isArray: "$comments" }, then: { $size: "$comments" }, else: "NA" } },
                likes: { $cond: { if: { $isArray: "$videoLikes" }, then: { $size: "$videoLikes" }, else: "NA" } },
            },
        },
    ])
        .then((data) => {
            res.json({
                data,
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

exports.getFetchAVideo = (req, res, next) => {
    const videoId = req.params.videoId;
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        const error = new Error("video Doesn't Exist");
        error.statusCode = 404;
        throw error;
    }
    Video.aggregate([
        {
            $match: { _id: ObjectId(videoId) },
        },
        { $limit: 1 },
        { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "creator" } },
        {
            $lookup: {
                from: "videolikes",
                localField: "_id",
                foreignField: "videoId",
                as: "videoLikes",
            },
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "videoId",
                as: "comments",
            },
        },
        {
            $project: {
                _id: 1,
                public: 1,
                creator: 1,
                comments: { $cond: { if: { $isArray: "$comments" }, then: { $size: "$comments" }, else: "NA" } },
                likes: { $cond: { if: { $isArray: "$videoLikes" }, then: { $size: "$videoLikes" }, else: "NA" } },
            },
        },
    ])
        .then((data) => {
            res.json({
                data,
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
                next(err);
            }
            next(err);
        });
};

exports.getFetchAllComments = (req, res, next) => {
    const videoId = req.params.videoId;
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        const error = new Error("Video Doesn't Exist");
        error.statusCode = 404;
        throw error;
    }
    const currentPage = req.query.page || 1;
    const perPage = 10;
    Comment.aggregate([
        { $skip: (currentPage - 1) * perPage },
        { $limit: perPage },
        { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "creator" } },
        {
            $lookup: {
                from: "commentlikes",
                localField: "_id",
                foreignField: "commentId",
                as: "likes",
            },
        },
        {
            $lookup: {
                from: "replies",
                localField: "_id",
                foreignField: "commentId",
                as: "replies",
            },
        },
        {
            $project: {
                _id: 1,
                public: 1,
                creator: 1,
                likesNumber: { $cond: { if: { $isArray: "$likes" }, then: { $size: "$likes" }, else: "NA" } },
                repliesNumber: { $cond: { if: { $isArray: "$replies" }, then: { $size: "$replies" }, else: "NA" } },
            },
        },
    ])
        .then((data) => {
            res.json({
                data,
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
                next(err);
            }
            next(err);
        });
};

exports.getFetchAllReplies = (req, res, next) => {
    const commentId = req.params.commentId;
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        const error = new Error("Comment Doesn't Exist");
        error.statusCode = 404;
        throw error;
    }
    const currentPage = req.query.page || 1;
    const perPage = 2;
    Reply.aggregate([
        { $skip: (currentPage - 1) * perPage },
        { $limit: perPage },
        { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "creator" } },
        {
            $lookup: {
                from: "replylikes",
                localField: "_id",
                foreignField: "replyId",
                as: "likes",
            },
        },
        {
            $project: {
                _id: 1,
                public: 1,
                creator: 1,
                likesNumber: { $cond: { if: { $isArray: "$likes" }, then: { $size: "$likes" }, else: "NA" } },
            },
        },
    ])
        .then((data) => {
            res.json({
                data,
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
                next(err);
            }
            next(err);
        });
};
