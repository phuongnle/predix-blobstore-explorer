var blobstoreService = require('../services/blobstore-service');

function getAllStores(req, res) {
    var simplifizedStores = blobstoreService.getCurrentBoundBlobstores().map(x => {
        return {
            "name": x.name,
            "bucketName": x.credentials.bucket_name
        };
    });
    res.json(simplifizedStores).end();
}

module.exports = {
    get: getAllStores
};