const express = require("express");
const AWS = require("aws-sdk");
const awsConfig = require("../config/aws-s3-config");
const uuid = require("uuid");
const auth = require('../middleware/auth')
const router = express.Router()


const S3_BUCKET = awsConfig.bucketName;
const s3 = new AWS.S3({
    accessKeyId: awsConfig.accessKeyId,
    secretAccessKey: awsConfig.secretAccessKey,
    region: awsConfig.region,
    signatureVersion: "v4",
    //   useAccelerateEndpoint: true
});

router.post("/generatePresignedUrl", auth, (req, res) => {
    let fileType = req.body.fileType;
    if (fileType !== ".jpg" && fileType !== ".png" && fileType !== ".jpeg") {
        return res.status(403)
            .send({ success: false, message: "Image format invalid" });
    }

    fileType = fileType.substring(1, fileType.length);

    const folder = req.body.folder;
    if (!folder) {
        return;
    }

    const fileName = uuid.v4();
    const s3Params = {
        Bucket: S3_BUCKET,
        Key: folder + "/" + fileName + "." + fileType,
        Expires: 60 * 60,
        ContentType: "image/" + fileType,
        ACL: "public-read",
    };

    s3.getSignedUrl("putObject", s3Params, (err, data) => {
        if (err) {
            console.log(err);
            return res.end();
        }
        const returnData = {
            success: true,
            message: "Url generated",
            uploadUrl: data,
            downloadUrl:
                `https://${S3_BUCKET}.s3.amazonaws.com/${folder}/${fileName}` + "." + fileType,
        };
        return res.status(201).json(returnData);
    });
});

module.exports = router