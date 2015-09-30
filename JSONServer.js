var http = require('http');
var url = require('url');
var fs = require('fs');

var ROOT_DIR = 'data';

var EXT_TYPES = {
    'css': 'text/css',
    'gif': 'image/gif',
    'htm': 'text/html',
    'html': 'text/html',
    'ico': 'image/x-icon',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'js': 'application/javascript', //should really be application/javascript
    'json': 'application/json',
    'png': 'image/png',
    'txt': 'text/text'
}

var get_ext = function(filename){
    for (var ext in EXT_TYPES){
        var type = EXT_TYPES[ext];
        if (filename.indexOf(ext, filename.length - ext.length) !== -1) return type;
    }
    return EXT_TYPE['txt'];
}

http.createServer(function(request, response){

    var URL = url.parse(request.url, true, false);

    console.log('Pathname: ' + URL.pathname);
    console.log('Method: ' + URL.method);

    var receivedData = '';
    
    request.on('data', function(chunk){
        receivedData += chunk;
    });

    request.on('end', function(){
        if(request.method == 'POST'){
            console.log(receivedData);

            if (URL.pathname.slice(0, 10) == '/writeFile'){
                console.log('Write File');
                var data = JSON.parse(receivedData);

                fs.writeFile('./data/' + URL.pathname.slice(11, URL.pathname.length), data.join('\n'), function (err) {
                    if (err){
                        console.log('File Writing Error: ' + err);
                    }
                });

            }
        } 
    });

    if(request.method == 'GET'){
        var filePath = ROOT_DIR + URL.pathname;

        fs.readFile(filePath, function(err, data){
            if (err){
                console.log('Get Error: ' + err);

                response.writeHead(404);
                response.end(JSON.stringify(err));
            } else {
                response.writeHead(200, {'Content-Type': get_ext(filePath)});
                response.end(data);
            }
        });
    }

}).listen(3000);

console.log('Sever has been created at Port 3000. Press CRL-C to exit');
