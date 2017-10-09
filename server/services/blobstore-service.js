var stores = [],
    storesByBucketName = {},
    sdk = require('aws-sdk');

function initialize() {
    var node_env = process.env.node_env || 'development';

    if (node_env === 'development') {
        stores = require('../sample-data/predix-blobstore/stores.json')['predix-blobstore'];
    } else {
        stores = JSON.parse(process.env.VCAP_SERVICES)['predix-blobstore'];
    }

    stores.forEach(store => {
        storesByBucketName[store.credentials.bucket_name] = store;
    })
}

function getClient(bucketName) {
    var bucket = storesByBucketName[bucketName];

    if (!bucket) return null;

    var s3Obj = {
        accessKeyId: bucket.credentials.access_key_id,
        secretAccessKey: bucket.credentials.secret_access_key,
        endpoint: bucket.credentials.host,
        signatureVersion: 'v4'
    };

    console.log(s3Obj);

    return new sdk.S3(s3Obj);
}


module.exports = {
    initialize: initialize,
    getCurrentBoundBlobstores: function () { return stores; },
    getBlobstoreByBucketName: function (bucketName) { return storesByBucketName[bucketName]; },
    getClientByBucketName: function (bucketName) { return getClient(bucketName); }
}