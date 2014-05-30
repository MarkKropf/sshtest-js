var Connection = require('ssh2');
var http = require('http');
var url = require('url');
var datar = "";

var c = new Connection();
var server = http.createServer().listen(process.env.PORT, process.env.VCAP_APP_HOST);

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
c.connect({
  host: 'os.sparkhosting.com',
  port: 22,
  username: 'frylock',
  password: 'nodejsrules'
});

server.on('request', function(req, res) {
	var url_parts = url.parse(req.url, true);
	var method = req.method;
	var remoteAddress = req.connection.remoteAddress;
	var body = '';
	var requestData = '';
	switch(url_parts.pathname) {
		case '/':
		case '/index.html':
      var queryData = url.parse(req.url, true).query;
      c.end();
      if (queryData.user && queryData.pass) {
        c.connect({host: 'os.sparkhosting.com', port: 22, username: queryData.user, password: queryData.pass });
      }
			body = '{"message": "Welcome to SSHTest",\n"method": ' + method + ',\n"datar": \n"' + datar + '"}';
      datar = "";
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

// example output:
// Connection :: connect
// Connection :: ready
// TCP :: DATA: HTTP/1.1 200 OK
// Date: Thu, 15 Nov 2012 13:52:58 GMT
// Server: Apache/2.2.22 (Ubuntu)
// X-Powered-By: PHP/5.4.6-1ubuntu1
// Last-Modified: Thu, 01 Jan 1970 00:00:00 GMT
// Content-Encoding: gzip
// Vary: Accept-Encoding
// Connection: close
// Content-Type: text/html; charset=UTF-8
//
//
// TCP :: EOF
// TCP :: CLOSED
// Connection :: end
// Connection :: close
