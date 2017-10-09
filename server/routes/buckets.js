var blobstoreService = require('../services/blobstore-service'),
    sdk = require('aws-sdk');

function doUpload(req, res, client) {
    console.log('RECEIVED >>>>>>>');

    var fileName = req.params.fileName;
    var file = req.file;

    var params = {
        Bucket: req.params.bucketName,
        Key: fileName,
        ContentDisposition: fileName,
        Body: file.buffer
    };
    var options = {
        partSize: 10 * 1024 * 1024,
        queueSize: 2
    }

    client.upload(params, options, function (err, data) {
        if (err) {
            console.log(err);
            res.status(err.statusCode).end();

        } else {
            console.log('>>>>>>>');
            console.log(data);
            res.status(200).end();
        }
    });
}

function doDownload(req, res, client) {
    var fileName = req.params.fileName,
        params = {
            Bucket: req.params.bucketName,
            Key: fileName
        };

    client.headObject(params, function (err, data) {
        if (err) {
            console.log(err);
            res.status(err.statusCode || 500).end();
            return;
        }

        var s3Stream = client.getObject(params).createReadStream();

        s3Stream.on('error', (err) => res.status(err.statusCode || 500).end());
        s3Stream.on('end', () => console.log('Done streaming file ' + fileName));
        res.setHeader('Content-type', data.ContentType);
        res.setHeader('Content-disposition', data.ContentDisposition + "; filename=" + fileName);

        s3Stream.pipe(res);
    });
}

function execute(req, res, mainAction) {

    var client = blobstoreService.getClientByBucketName(req.params.bucketName);
    if (!client) {
        res.status(400).end();
        return;
    }
}

module.exports = {
    download: function (req, res) { execute(req, res, doDownload); },
    upload: function (req, res) { execute(req, res, doUpload); }
};



