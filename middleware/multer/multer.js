const multer = require("multer");
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const s3 = new aws.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
});
const profileBucket = process.env.AWS_PROFILE_PICTURE;
const videoBucket = process.env.AWS_VIDEO;
const profileFilter = (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const videosFilter = (req, file, cb) => {
    if (
        file.mimetype === "video/mp4" ||
        file.mimetype === "video/x-flv" ||
        file.mimetype === "application/x-mpegURL" ||
        file.mimetype === "video/MP2T" ||
        file.mimetype === "	video/3gpp" ||
        file.mimetype === "	video/quicktime" ||
        file.mimetype === "	video/x-msvideo" ||
        file.mimetype === "video/x-matroska"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

exports.profilePhotoUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: profileBucket,
        acl: "public-read",
        key: function (req, file, cb) {
            cb(null, Date.now() + "-" + file.originalname);
        },
    }),
    fileFilter: profileFilter,
}).single("image");

exports.newVideoUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: videoBucket,
        acl: "public-read",
        key: function (req, file, cb) {
            cb(null, Date.now() + "-" + file.originalname);
        },
    }),
    fileFilter: videosFilter,
}).single("videoFile");
