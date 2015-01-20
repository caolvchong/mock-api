var pagination = function(store, params) {
    store = store || [];
    params = params || {};

    var offset = +params.offset || 0;
    var limit = +params.limit || 10;
    var data = [];
    var next = Math.min(offset + limit, store.length - 1);
    for(var i = offset; i < next; i++) {
        data.push(store[i]);
    }
    return {
        data: data,
        pagination: {
            offset: next,
            limit: limit,
            total: store.length
        }
    }
};

exports.pagination = pagination;