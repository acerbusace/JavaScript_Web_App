//CODE WRITTEN BY IBRAHIM HELMY AND ALEX PATEL 


var canvas, prevMouseX, mouseX, prevMouseY, mouseY, fontSize;
var myWord;

var words;
 
function init() {
    canvas = document.getElementById("myCanvas");                 //  Gets te canvas by its ID
 
    canvas.addEventListener("mousedown", mouseDown, false);       // Listens for mouse clicks
    canvas.addEventListener("mousemove", mouseMove, false);       // Listens for mouse movment
 
    document.body.addEventListener("mouseup", mouseUp, false);    // Listens when mouse buttons are unclicked
    document.body.addEventListener("keydown", keyDown, false);    // Listens for when keyboard keys are clicked
    document.body.addEventListener("keyup", keyUp, false);        // Listens for when the keyboard keys are unclicked

    fontSize = 20;                                                // intilizes variable that sets size of font to be 24pt
    words = [];                                                   // intilizes variable that will contain an array of words

}

function mouseDown(e){                                            // when mouse is clicked down
    myWord = findWord();                                          // when true 

    e.stopPropagation();                                          
    e.preventDefault();                                           // Stop chrome from taking control of your mouse 

    draw();
}
 
function mouseMove(e){
    mouseX = e.pageX - canvas.offsetLeft;                         // stores mouse's x position
    mouseY = e.pageY - canvas.offsetTop;                          // stores mouse's y position

    if (myWord != null){                                          // As Long as the word being clicked does not turn up as null
        myWord.x += mouseX - prevMouseX;                          // += the clicked word's x position to be set to the how much the mouse's x position has moved by
        myWord.y += mouseY - prevMouseY;                          // += the clicked word's y position to be set to the how much the mouse's y position has moved by
    }

    prevMouseX = mouseX;                                          // Sets the location of the mouse X to be where it is now (prevmouse is where ti was before it was moved, mouse is where it is now)
    prevMouseY = mouseY;                                          // Sets the location of the mouse Y to be where it is now (prevmouse is where ti was before it was moved, mouse is where it is now)

    e.stopPropagation();

    draw();
}

function mouseUp(e){                                              // stops myWord to being set to what was previously clicked
    myWord = null;

    e.stopPropagation();

    draw();
}

function keyDown(e){
    if (e.keyCode == 46){                                         // if it is the 'delete' key
        var selectedWord = findWord();                            // finds the word the mouse is currently hovering over 
        for (var i in words){
            if (selectedWord.name == words[i].name && selectedWord.x == words[i].x && selectedWord.y == words[i].y){
                words.splice(i, 1);                               // deletes the word
            }
        }
    }

    draw();
}

function keyUp(e){                                               // as long as no keys are clicked, draw same frame again and again 
    draw();
}

function findWord(){                                             // Function that finds the word that the mouse is hovering over
    for (var i in words){
        if (mouseX > words[i].x && mouseX < words[i].x + canvas.getContext('2d').measureText(words[i].name).width && mouseY > words[i].y - fontSize && mouseY < words[i].y){
            return words[i];
        }
    }
    return null;                                                 // if mouse is not hovering over anything return null
}

function handleOpenButton(){                                     // gets the text from the text field
    var text = $('#textField').val();                            // if text is not blank
    if (text && text != ''){                                     // sends a get request to the server
        $.post('openFile/' + text, function(data){               // empties the words array
            words = [];                                          // splits lines of newly opned text file
            var lines = JSON.parse(data);

            var yPos = fontSize + fontSize/3;                    // its sets the y position of the words
            for (var i in lines){
                var sentenceWords = lines[i].split(" ");         // splits words into lines() indexed by their spaces

                var xPos = fontSize;                             // makes the xPos equivilant to the size of the font
                var xPosCorus = xPos;                             
                for (var j in sentenceWords){                    
                    if (sentenceWords[j].indexOf('[') == -1){
                        words.push({name:sentenceWords[j], x:xPos, y:yPos, chorus:false});
                    } else {
                        var text = sentenceWords[j];

                        chorusXPos = xPos;

                        while(text.indexOf('[') != -1){
                            words.push({name:text.slice(text.indexOf('['), text.indexOf(']') + 1), x:chorusXPos, y:yPos - (fontSize + fontSize/3), chorus:true});

                            chorusXPos += canvas.getContext('2d').measureText(text.slice(text.indexOf('['), text.indexOf(']') + 1)).width + fontSize/2;
                            
                            text = text.slice(0, text.indexOf('[')) + text.slice(text.indexOf(']') + 1);

                        }
                         
                        words.push({name:text, x:xPos, y:yPos, chorus:false});                       
                    }

                    xPos += canvas.getContext('2d').measureText(sentenceWords[j]).width + fontSize/2;
                }
                yPos += (fontSize + fontSize/3)*2;
            }
        });
    }
}

function handleSaveButton(){                                       // Saves the screen to the song file
    var text = $('#textField').val();                              // Looks at textfile to assign a filename
    if (text && text != ''){                                     
        var wordsInY = words.slice();
                                                                   // Turns all words back into the array and stores it for future reference (in below code)
        var data = [];
        while (wordsInY.length != 0){
            var wordsInX = [];
            var line = '';

            wordsInY.sort(function(wordOne, wordTwo){
                if (wordOne.y < wordTwo.y){
                    return -1;
                } else if (wordOne.y > wordTwo.y){
                    return 1;
                }
                return 0;
            });
    
            var j = 0;
            while (wordsInY[j].name.indexOf('[') != -1){
                j++;
            }
            wordsInX.push(wordsInY[j]);
            wordsInY.splice(j, 1);

            for (var i = 0; i < wordsInY.length; i++){
                if (wordsInY[i].y < wordsInX[0].y + fontSize/2){
                    wordsInX.push(wordsInY[i]);
                    wordsInY.splice(i, 1);
                    i--;
                }
            }

            wordsInX.sort(function(wordOne, wordTwo){
                if (wordOne.x < wordTwo.x){
                    return -1;
                } else if (wordOne.x > wordTwo.x){
                    return 1;
                }
                return 0;
            });

            for (var i in wordsInX){
                line += wordsInX[i].name + ' ';
            }
            data.push(line);
        }

        $.post('writeFile/' + text, JSON.stringify(data));            // Complete file saving process
    }
}

function handleInsertButton(){                                        // In Charge of taking care of word insertion into the canvas 
    var text = $('#insertTextField').val();
    
    if (text && text != ''){
        if (text.indexOf('[') == -1){
            words.push({name:text, x:fontSize, y:canvas.height-fontSize, chorus:false});
        } else{
            words.push({name:text, x:fontSize, y:canvas.height-fontSize, chorus:true});
        }
    }
}

function draw(){                                                     // the function that draws the frames and canvas and words, and practically everything on screen 
    var context = canvas.getContext('2d');
    context.font = '20pt Arial';
    context.fillStyle = 'rgb(255,0,0)';
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (var i in words){
        if (words[i].chorus){
            context.fillStyle = 'rgb(0,255,0)';
            context.fillText(words[i].name.replace("[", " ").replace("]", " "), words[i].x, words[i].y);
        } else{
            context.fillStyle = 'rgb(0,0,255)';
            context.fillText(words[i].name, words[i].x, words[i].y);
        }
    }
}
