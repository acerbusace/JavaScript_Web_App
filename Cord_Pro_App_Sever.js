//CODE WRITTEN BY IBRAHIM HELMY AND ALEX PATEL 


// These are like import statements in java (equal to var in order to import)
var http = require('http'); // http library: module related to servers
var url = require('url');   // URL library: for parces the URL
var fs = require('fs');     // fs Library: that Opens and reads files

var ROOT_DIR = 'data';// addresses to the folders where the data is contained
var HTML_DIR = '/html';
var SONGS_DIR = '/songs';

var EXT_TYPES = { // small array containing the many extension types we use.
    'css': 'text/css',
    'gif': 'image/gif',
    'htm': 'text/html',
    'html': 'text/html',
    'ico': 'image/x-icon',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'js': 'application/javascript', 
    'json': 'application/json',
    'png': 'image/png',
    'txt': 'text/text'
}

var get_ext = function(filename){  // gets the extensions from above
    for (var ext in EXT_TYPES){    // For every extension in the array 
        var type = EXT_TYPES[ext]; // it sets the return type to the type specified to the extension at that spesific index
        if (filename.indexOf(ext, filename.length - ext.length) !== -1) return type; // if it finds the extension in the filename it will return that extension
    } // find ext in, filename - extention and check to see if the extension of the file matches the extension type of the index in the array
    return EXT_TYPE['txt'];       // returns txt if it did not find it
}

http.createServer(function(request, response){ // Craetes the server

    var URL = url.parse(request.url, true, false); // it gives it useful properties such as:

    console.log('Pathname: ' + URL.pathname);      // The pathname of the file the user is looking for
    console.log('Method: ' + request.method);      // Which method the request came from (get, post, etc.)

    var receivedData = '';                         // var to store recieved data is currently empty
    
    request.on('data', function(chunk){            // If the user is sending a request to you and supplying some sort of information, it collects it
        receivedData += chunk;                     // and saves it in received data
    });

    request.on('end', function(){                  // If it has finished sending me all the information, 
        if(request.method == 'POST'){              // and if the request method is a post method then this will trigger
            console.log(receivedData);             // prints out the request data

            if (URL.pathname.slice(0, 10) == '/writeFile'){  // if the URL's pathname is == to pathfile, then the user wants me to save the data
                console.log('Write File');                   // this prints to the console 
                var data = JSON.parse(receivedData);         // this parses the recieved data to its original form and it saves to data

                fs.writeFile(ROOT_DIR + SONGS_DIR + URL.pathname.slice(10, URL.pathname.length), data.join('\n'), function (err) { // it writes to the file
                    if (err){ // if an error occurs 
                        console.log('File Writing Error: ' + err); // prints out the error 
                    }
                });

            } else if (URL.pathname.slice(0, 9) == '/openFile'){   // otherwise open the file
                console.log('Open File');

                fs.readFile(ROOT_DIR + SONGS_DIR + URL.pathname.slice(9, URL.pathname.length), function(err, data){ // and collect the line we need
                    if (err){ // In case an error occurs it prints out the error
                        console.log('Get Error: ' + err);
                    } else {
                        var lines = data.toString().split("\n");
                        response.end(JSON.stringify(lines));
                    }
                });
            }
        } 
    });

    if(request.method == 'GET'){                            // If the request type was of type GET
        var filePath = ROOT_DIR + HTML_DIR + URL.pathname;  // does data plus pathname [data/Golden Hair.txt]

        fs.readFile(filePath, function(err, data){          // it reads the file if found 
            if (err){                                       // otherwise an error is produced
                console.log('Get Error: ' + err);

                response.writeHead(404);
                response.end(JSON.stringify(err));
            } else {
                response.writeHead(200, {'Content-Type': get_ext(filePath)});
                response.end(data);
            }
        });
    }

}).listen(3000);                                            // listens for user requests at port 3000

console.log('Sever has been created at Port 3000. Press CRL-C to exit.');
