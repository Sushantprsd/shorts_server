const express = require("express");
const router = express.Router();
const userController = require("../controller/user");
const isAuth = require("../middleware/isAuth");
const multerHelper = require("../middleware/multer/multer");

router.post("/user/profile/dp/update", isAuth, multerHelper.profilePhotoUpload, userController.postDisplayPicture);
router.post("/user/video/upload", isAuth, multerHelper.newVideoUpload, userController.postNewVideo);
router.post("/user/video/like/:videoId", isAuth, userController.postToggleLikeVideo);
router.post("/user/video/comment/add/:videoId", isAuth, userController.postAddComment);
router.post("/user/video/comment/like/:commentId", isAuth, userController.postToggleLikeComment);
router.post("/user/video/comment/reply/add/:commentId", isAuth, userController.postAddReply);
router.post("/user/video/comment/reply/like/:replyId", isAuth, userController.postToggleLikeReply);
router.post("/user/video/:videoId", isAuth, userController.postDeleteVideo);
router.post("/user/video/comment/delete/:commentId", isAuth, userController.postDeleteComment);
router.post("/user/video/comment/reply/delete/:replyId", isAuth, userController.postDeleteReply);

module.exports = router;
