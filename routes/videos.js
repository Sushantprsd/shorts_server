const express = require("express");
const router = express.Router();
const videoController = require("../controller/videos");

router.get("/video/all",videoController.getFetchAllVideos);
router.get("/video/:videoId",videoController.getFetchAVideo);
router.get("/video/comment/all/:videoId",videoController.getFetchAllComments);
router.get("/video/comment/reply/all/:commentId",videoController.getFetchAllReplies);
module.exports = router;
