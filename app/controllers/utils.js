var handleError = function(err, client, done, res) {
  // no error occurred, continue with the request
  if(!err) return false;

  // An error occurred, remove the client from the connection pool.
  if(client){
    done(client);
  }
  res.writeHead(500, {'content-type': 'text/plain'});
  res.end('An error occurred');
  console.error("Error handler ran on", err);
  return true;
};

exports.handleError = handleError;
