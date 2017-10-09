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

    client.upload(params, options, (err, data) => {
        handleResponse(req, res, err, data, genericResponse);
    });
}

function doDownload(req, res, client) {
    var fileName = req.params.fileName,
        params = {
            Bucket: req.params.bucketName,
            Key: fileName
        };

    client.headObject(params, (err, data) => {
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

function doDelete(req, res, client) {
    var fileName = req.params.fileName,
        params = {
            Bucket: req.params.bucketName,
            Key: fileName
        };

    client.deleteObject(params, (err, data) => {
        handleResponse(req, res, err, data, genericResponse);
    });
}

function doGetObjects(req, res, client) {
    var params = {
        Bucket: req.params.bucketName,
        Delimiter: ''
    };

    client.listObjects(params, (err, data) => {
        handleResponse(req, res, err, data, genericResponse);
    });
}

function doGetObjectsV2(req, res, client) {
    var params = {
        Bucket: req.params.bucketName,
        Delimiter: ''
    };

    client.listObjectsV2(params, (err, data) => {
        handleResponse(req, res, err, data, genericResponse);
    });
}

function execute(req, res, mainAction) {

    var client = blobstoreService.getClientByBucketName(req.params.bucketName);
    if (!client) {
        res.status(400).end();
        return;
    }

    mainAction(req, res, client);
}

function handleResponse(req, res, err, data, successfulAction) {
    if (err) {
        console.log(err, err.stack);
        res.json(err).status(err.statusCode || 500).end();
    } else {
        successfulAction(res, data);
    }
}

function genericResponse(res, data) {
    console.log('------------');
    console.log(data);
    res.send(data).end();
}

module.exports = {
    download: function (req, res) { execute(req, res, doDownload); },
    upload: function (req, res) { execute(req, res, doUpload); },
    delete: function (req, res) { execute(req, res, doDelete); },
    getObjects: function (req, res) { execute(req, res, doGetObjects); },
    getObjectsV2: function (req, res) { execute(req, res, doGetObjectsV2); }
};



