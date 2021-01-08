const aws = require("aws-sdk");

const s3 = new aws.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
});

const deleteFile = (bucketName, key) => {
    var params = {
        Bucket: bucketName,
        Key: key,
    };

    s3.deleteObject(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else console.log();
    });
};

exports.deleteFile = deleteFile;
