var stores = [],
    storesByBucketName = {};

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

module.exports = {
    initialize: initialize,
    getCurrentBoundBlobstores: function () { return stores; },
    getBlobstoreByBucketName: function (bucketName) { return storesByBucketName[bucketName]; }
}