exports.handleError = function(res) {
  return function(err) {
    // Promises may reject with null to signal that a response has already been sent
    if (!err)
      return;

    res.writeHead(500, {'content-type': 'text/plain'});
    res.end('An error occurred');
    console.error("Error handler ran on", err);
  }
};

exports.filterObject = function(keys, obj) {
  var v = {};
  keys.forEach(function(attr) {
    v[attr] = obj[attr];
  });
  return v;
};
