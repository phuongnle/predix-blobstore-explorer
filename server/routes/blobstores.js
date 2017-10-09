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


function getAllStores(req, res) {
    var simplifizedStores = stores.map(x => {
        return {
            "name": x.name,
            "bucketName": x.credentials.bucket_name
        };
    });
    res.json(simplifizedStores).end();
}

module.exports = {
    initialize: initialize,
    get: getAllStores
};