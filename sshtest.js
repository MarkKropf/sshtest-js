var Connection = require('ssh2');
var http = require('http');
var url = require('url');
var datar = "";

var c = new Connection();
if (process.env.PORT === undefined) {
  var server = http.createServer().listen(3000, '0.0.0.0');
} else {
  var server = http.createServer().listen(process.env.PORT, process.env.VCAP_APP_HOST);
}

c.on('ready', function() {
  datar += 'Connection :: ready\n';
  console.log('Connection :: ready');
});
c.on('error', function(err) {
  datar += 'Connection :: error :: ' + err + '\n';
  console.log('Connection :: error :: ' + err);
});
c.on('end', function() {
  datar += 'Connection :: end\n';
  console.log('Connection :: end');
});
c.on('close', function(had_error) {
  datar += 'Connection :: close\n';
  console.log('Connection :: close');
});

server.on('request', function(req, res) {
	var url_parts = url.parse(req.url, true);
  var query = require('url').parse(req.url,true).query;
	var method = req.method;
	var remoteAddress = req.connection.remoteAddress;
	var body = '';
	var requestData = '';
	switch(url_parts.pathname) {
		case '/':
		case '/index.html':
      if (query.host === undefined) {
        body = 'Please provide a host & port value in the query string';
      } else {
        var host = query.host;
        if (query.port === undefined) {
          var port = 22;
        } else {
          var port = query.port;
        }
        c.connect({host: host, port: port, username: 'test', password: 'test' });
        body = '{"message": "Welcome to SSHTest",\n"host": ' + host + ',\n"port": ' + port + ',\n"method": ' + method + ',\n"datar": \n"' + datar + '"}';
        datar = "";
      }
			response_end();
			break;
		default:
			body = 'Unknown path: ' + JSON.stringify(url_parts);
			response_end();
	}

	function response_end() {
		res.writeHead(200, {
			'Content-Length': body.length,
			'Content-Type': 'text/json' });
		res.write(body);
		res.end();
	}
});
