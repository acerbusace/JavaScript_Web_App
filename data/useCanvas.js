var canvas, prevMouseX, mouseX, prevMouseY, mouseY, str, fontSize;
var mouseClicked;
var myWord;

var words;
var chorus;
var lines;
var oneLine;

 
function init() {
    canvas = document.getElementById("myCanvas");
 
    canvas.addEventListener("mousedown", mouseDown, false);
    canvas.addEventListener("mousemove", mouseMove, false);
 
    document.body.addEventListener("mouseup", mouseUp, false);
    document.body.addEventListener("keydown", keyDown, false);
    document.body.addEventListener("keyup", keyUp, false);

    str = 'Welp GG';
    oneLine = '';
    fontSize = 24;
    words = [];

    

}

function mouseDown(e){
    //str = 'Down';
    mouseClicked = true;
    myWord = findWord();

    e.stopPropagation();
    e.preventDefault();

    draw();
}
 
function mouseMove(e){
    //str = 'Move';
    mouseX = e.pageX - canvas.offsetLeft;
    mouseY = e.pageY - canvas.offsetTop;

    if (myWord != null){
        myWord.x += mouseX - prevMouseX;
        myWord.y += mouseY - prevMouseY;
    }

    prevMouseX = mouseX;
    prevMouseY = mouseY;

    e.stopPropagation();

    draw();
}

function mouseUp(e){
    //str = 'Up';
    mouseClicked = false;
    myWord = false;

    e.stopPropagation();

    draw();
}

function keyDown(e){
    str = e.keyCode;

    if (e.keyCode == 46){
        var selectedWord = findWord();
        for (var i in words){
            if (selectedWord.name == words[i].name && selectedWord.x == words[i].x && selectedWord.y == words[i].y){
                words.splice(i, 1);
            }
        }
    }

    draw();
}

function keyUp(e){
    str = 'keyUp';

    draw();
}

function findWord(){
    for (var i in words){
        if (mouseX > words[i].x && mouseX < words[i].x + canvas.getContext('2d').measureText(words[i].name).width && mouseY > words[i].y - fontSize && mouseY < words[i].y){
            return words[i];
        }
    }
    return null;
}

function handleOpenButton(){
    var text = $('#textField').val();
    if (text && text != ''){
        $.get(text, function(data){
            words = [];
            lines = data.toString().split("\n");

            var yPos = fontSize + fontSize/3;
            for (var i in lines){
                var sentenceWords = lines[i].split(" ");

                var xPos = fontSize;
                var xPosCorus = xPos;
                for (var j in sentenceWords){
                    if (sentenceWords[j].indexOf('[') == -1){
                        words.push({name:sentenceWords[j], x:xPos, y:yPos, chorus:false});
                    } else {
                        words.push({name:sentenceWords[j], x:xPos, y:yPos - (fontSize + fontSize/3), chorus:true});   
                    }

                    xPos += canvas.getContext('2d').measureText(sentenceWords[j]).width + fontSize/2;
                }
                yPos += (fontSize + fontSize/3)*2;
            }
        });
    }
}

function handleSaveButton(){
    var text = $('#textField').val();
    if (text && text != ''){
    var wordsInY = words.slice();

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
        oneLine += wordsInX[i].name + ' ';
    }
    data.push(line);
    }

    $.post('writeFile/' + text, JSON.stringify(data));
    }
}

function draw(){
    var context = canvas.getContext('2d');
    context.font = '24pt Arial';
    context.fillStyle = 'rgb(255,0,0)';
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillText(mouseX + ', ' + mouseY + ', ' + str, canvas.width-450, fontSize);
    context.fillText(oneLine, fontSize, fontSize*2);

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
