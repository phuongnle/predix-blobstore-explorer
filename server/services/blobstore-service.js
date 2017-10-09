var stores = [],
    storesByBucketName = {},
    sdk = require('aws-sdk');

function initialize() {
    var node_env = process.env.node_env || 'development';

    if (node_env === 'development') {
        stores = require('../sample-data/predix-blobstore/stores.json')['predix-blobstore'];
    } else {
        var vcapsServices = JSON.parse(process.env.VCAP_SERVICES)['predix-blobstore'];
    }

    storesByBucketName = stores.reduce((a, b) => {
        a[b.credentials.bucket_name] = b;
        return a;
    }, {});
}

function getClient(bucketName) {
    var bucket = storesByBucketName[bucketName];

    if (!bucket) return null;

    return new aws.S3({
        accessKeyId: bucket.access_key_id,
        secretAccessKey: bucket.secret_access_key,
        endpoint: bucket.url,
        signatureVersion: 'v4'
    });
}


module.exports = {
    initialize: initialize,
    getCurrentBoundBlobstores: function () { return stores; },
    getBlobstoreByBucketName: function (bucketName) { return storesByBucketName[bucketName]; },
    getClientByBucketName: function (bucketName) { return getClient(bucketName); }
}