const express = require('express');
const AWS = require('aws-sdk');
const uuid = require('uuid');
const auth = require('../middleware/auth');

const router = express.Router();

const S3_BUCKET = process.env.S3_BUCKET_NAME;

AWS.config.region = 'us-east-2';

const s3 = new AWS.S3({
  signatureVersion: 'v4',
});

/**
 * This endpoint calls aws to generate upload url and download url.
 * The urls will be returned to frontend.
 * Frontend will use upload url to upload image to s3 directly and
 * make another service call to store download url in database.
 */
router.post('/generatePresignedUrl', auth, (req, res) => {
  let { fileType } = req.body;
  if (fileType !== '.jpg' && fileType !== '.png' && fileType !== '.jpeg') {
    return res.status(403)
      .send({ success: false, message: 'Image format invalid' });
  }

  fileType = fileType.substring(1, fileType.length);

  const { folder } = req.body;
  if (!folder) {
    return res.status(403)
      .send({ success: false, message: 'folder not specified in request body' });
  }

  const fileName = uuid.v4();
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: `${folder}/${fileName}.${fileType}`,
    Expires: 60 * 60,
    ContentType: `image/${fileType}`,
    ACL: 'public-read',
  };

  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if (err) {
      console.log(err);
      return res.end();
    }
    const returnData = {
      success: true,
      message: 'Url generated',
      uploadUrl: data,
      downloadUrl:
                `${`https://${S3_BUCKET}.s3.amazonaws.com/${folder}/${fileName}.`}${fileType}`,
    };
    return res.status(201).json(returnData);
  });
});

module.exports = router;
