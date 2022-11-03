//global variables
var body_text;
var title_text;
var body_words = [];
var textbox;
var current_word;
var current_word_num = 0;
var time_start;
var time_end;
var final_time;
var failed_current_word;
var mistakes;
var ended;
var sfx_mute = false;
var lucky_sfx = new Audio('sound/complete.mp3');
var countdown_3 = new Audio('sound/3.mp3');
var countdown_2 = new Audio('sound/2.mp3');
var countdown_1 = new Audio('sound/1.mp3');
var error_sfx = new Audio('sound/error.mp3');

document.addEventListener('DOMContentLoaded', function() {
    //disabling autocorrect for the textbox
    document.getElementById('typing_box').setAttribute('autocomplete', 'off')
    document.getElementById('typing_box').setAttribute('autocorrect', 'off')
    document.getElementById('typing_box').setAttribute('autocapitalize', 'off')
    document.getElementById('typing_box').setAttribute('spellcheck', false)

    //Hiding game elements on load
    document.getElementById('typing_box').style.display = "none";
    document.getElementById('word_to_type').style.display = "none";
    document.getElementById('div_win').style.display = "none";


    //OnClick Event Delegation for anything in the body
    document.body.onclick = (e) => {handle_events(e)}

    function handle_events(e) {
        //If the button is clicked, run the search
        if (e.target.id=='start_button') {
            startGame();
        }
        //If the retry button is pressed, start the game again
        if (e.target.id=='retry_button') {
            startGame();
        }
        //Mute toggle
        if (e.target.id=='mute_toggle') {
            toggleMute();
        }
    }
});

async function startGame(){
    ended = false;
    current_word_num = 0;
    mistakes = 0;
    failed_current_word = false;
    hideGameElements();
    hideStartElements();
    //await getRandomTitle();
    await getArticle();
    countThreeSeconds();
    //pauses execution for the data to be fetched
    await new Promise(resolve => setTimeout(resolve, 3100));
    isolateWords();
    document.getElementById('title_target').innerHTML = title_text;
    showGameElements();
    time_start = Date.now();
}

function endGame(){
    document.getElementById('typing_box').blur();
    document.getElementById('typing_box').style.display = "none";
    document.getElementById('word_to_type').innerHTML = "";
    time_end = Date.now();
    final_time = time_end-time_start;
    showResults();
    playSound(0);
}

function showResults() {
    //showing the results
    document.getElementById("div_win").style.display = "block";
    document.getElementById('div_win').innerHTML = "";

    //creating time display
    let winText = document.createElement('h2');
    winText.innerHTML = "Nice! Completed in "+Math.floor(final_time/1000)+" seconds!";
    document.getElementById('div_win').appendChild(winText);
    
    //creating wpm display
    let wpm_text = document.createElement("p");
    wpm_text.innerHTML = "That's a typing speed of "+"<span style='color: gold;'>"+getWPM()+"</span>"+" words per minute!"
    wpm_text.style.marginTop = "2%";
    document.getElementById('div_win').appendChild(wpm_text);

    //creating mistakes display
    let mistakes_text = document.createElement("p");
    mistakes_text.innerHTML = "You made "+"<span style='color: red;'>"+mistakes+"</span>"+" mistake(s).";
    if (mistakes == 0) {
        mistakes_text.innerHTML += " Good going!"
    } else if (mistakes < 10) {
        mistakes_text.innerHTML += " Not too shabby!"
    } else {
        mistakes_text.innerHTML += " Take it slow and try again!"
    }
    mistakes_text.style.marginTop = "2%";
    document.getElementById('div_win').appendChild(mistakes_text);

    //create link message
    let link_text = document.createElement("p");
    link_text.innerHTML = "Want to read more? Click here:";
    link_text.style.marginTop = "2%";
    document.getElementById('div_win').appendChild(link_text);

    //creating link to article
    let link = document.createElement("a");
    link.href = "https://en.wikipedia.org/wiki/"+title_text;
    link.target = "_blank";
    link.innerHTML = title_text;
    link.style.display = 'block';
    link.style.marginBottom = "10%";
    document.getElementById('div_win').appendChild(link);

    //creating retry button
    let retryButton = document.createElement("button");
    retryButton.id = "retry_button";
    retryButton.innerHTML = "Try Again?";
    retryButton.style.display = 'inline-block';
    //retryButton.style.marginTop = "10%";
    document.getElementById('div_win').appendChild(retryButton);
}

//Generates a random wiki article (old,obsolete,trash,dont use this)
function getRandomTitle() {
    fetch('https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=&generator=random&redirects=1&formatversion=latest&grnnamespace=0&grnlimit=1')
    .then((response) => {return response.json();})
    .then((results) => {
        //term = results.query.pages[0].title;
        term = "Ōiso";
        fetch('https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&titles='+term+'&redirects=1&formatversion=latest&exsentences=1&exlimit=1&exintro=1&explaintext=1')
            .then((response) => {return response.json();})
            .then((results) => {
                text = results.query.pages[0].extract;
                if(text.length > 0) {
                    title_text = term;
                    console.log("before: "+text);
                    body_text = text.replace(/Ú|Ù|Û|Ü/g, 'U').replace(/ú|ù|û|ü/g, 'u').replace(/Œ/g, 'OE').replace(/œ/g, 'oe').replace(/Ó|Ò|Ô|Ö|Õ|Ō|Ø/g, 'O').replace(/ó|ò|ô|ö|õ|ō|ø/g, 'o').replace(/Ñ/g, 'N').replace(/ñ/g, 'n').replace(/Í|Ì|Î|Ï|İ/g, 'I').replace(/í|ì|í|í|î|ï/g, 'i').replace(/É|È|Ê|Ë/g, 'E').replace(/é|è|ê|ë/g, 'e').replace(/Ç/g, 'C').replace(/ç/g, 'c').replace(/Æ/g, 'AE').replace(/æ/g, 'ae').replace(/Á|À|Â|Ä|Ã|Å|Â|Ă|Â|À/g, 'A').replace(/á|à|â|ä|ã|å|â|ă|â|à/g, 'a').replace(/–/g, '-').replace(/[^a-z0-9 -.,:]/gi, '');
                    console.log("after: "+body_text);
                    console.log("fetch complete");
                }
            })
            .catch((err) => {console.error(err)});
        
    })
    .catch((err) => {console.error(err);});
}

function getArticle() {
    fetch('https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&generator=random&redirects=1&formatversion=latest&grnnamespace=0&grnlimit=1&exsentences=1&exlimit=1&exintro=1&explaintext=1')
    .then((response) => {return response.json();})
    .then((results) => {
        title_text = results.query.pages[0].title;
        body_text = results.query.pages[0].extract.replace(/Ú|Ù|Û|Ü/g, 'U').replace(/ú|ù|û|ü/g, 'u').replace(/Œ/g, 'OE').replace(/œ/g, 'oe').replace(/Ó|Ò|Ô|Ö|Õ|Ō|Ø/g, 'O').replace(/ó|ò|ô|ö|õ|ō|ø/g, 'o').replace(/Ñ/g, 'N').replace(/ñ/g, 'n').replace(/Í|Ì|Î|Ï|İ/g, 'I').replace(/í|ì|í|í|î|ï/g, 'i').replace(/É|È|Ê|Ë/g, 'E').replace(/é|è|ê|ë/g, 'e').replace(/Ç/g, 'C').replace(/ç/g, 'c').replace(/Æ/g, 'AE').replace(/æ/g, 'ae').replace(/Á|À|Â|Ä|Ã|Å|Â|Ă|Â|À/g, 'A').replace(/á|à|â|ä|ã|å|â|ă|â|à/g, 'a').replace(/–/g, '-').replace(/[^a-z0-9 -.,:]/gi, '');

    })
    .catch((err) => {console.error(err)});
}

async function countThreeSeconds() {
    document.getElementById('title_target').innerHTML = "3";
    playSound(3);
    await new Promise(resolve => setTimeout(resolve, 1000));
    document.getElementById('title_target').innerHTML = "2";
    playSound(2);
    await new Promise(resolve => setTimeout(resolve, 1000));
    document.getElementById('title_target').innerHTML = "1";
    playSound(1);
    await new Promise(resolve => setTimeout(resolve, 1000));
}

function hideStartElements() {
    document.getElementById('start_button').style.display = "none";
    document.getElementById('intro_blurb').style.display = "none";
}

function showGameElements() {
    document.getElementById('typing_box').style.display = "inline-block";
    document.getElementById('word_to_type').style.display = "block";
    setNewWordToType();
    textbox = document.getElementById('typing_box');
    textbox.focus();
}

function hideGameElements() {
    document.getElementById('body_target').innerHTML = "";
    document.getElementById('typing_box').style.display = "none";
    document.getElementById('word_to_type').style.display = "none";
    document.getElementById("div_win").style.display = "none";
}

function isolateWords() {
    //Splitting up each word with every space
    body_words = body_text.split(" ");
    
    //Removing words that are just empty space
    while(!(body_words.indexOf("") == -1)) {
        console.log("Cleaning up spaces!")
        body_words.splice(body_words.indexOf(""), 1);
    }

    //Sometimes, a word will be both last word of one sentence and the beginning of another, resulting in something like 'end.Start' as a word
    //If we encounter this, lets fix it by detecting a period, but only periods that are in the middle of a word (to avoid actual sentence ending periods)
    let max_count = body_words.length;
    for (let i = 0; i<max_count; i++) {
        let word = body_words[i];
        if (word.includes(".") && word.indexOf(".")!=(word.length-1) && !(/\d/.test(word))) {
            console.log("Word is: "+word);
            console.log("And the . is at: "+word.indexOf("."));
            let newWord1 = word.substring(0, word.indexOf("."));
            let newWord2 = word.substring(word.indexOf(".")+1);
            if (newWord2==")" || newWord2 =="]") {
               continue; 
            }
            else {
                body_words.splice(i, 1, newWord1, newWord2);
                max_count+=1;
            }
        }
    }

    for (i in body_words) {
        //Adding a space back to each word, except the last one.
        if (i < body_words.length-1) {
            body_words[i]+=" ";
        }
        //Programmatically adding each word to the DOM
        //This is done to add a unique id to each word.
        let temp = document.createElement("span");
        if (i==0) {
            temp.innerHTML = body_words[i];
        }
        else {
            temp.innerHTML = " "+body_words[i];
        }
        temp.id = "word"+i;
        document.getElementById("body_target").appendChild(temp);
    }
    //console.log(body_words);
}

function scanInput() {
    //console.log("scanning...");
    if (textbox.value==body_words[current_word_num]) {
        //Handling when a word is fully typed
        let target = document.getElementById("word"+current_word_num);
        target.style.backgroundColor = "green";
        target.style.color = "white";
        console.log("word "+body_words[current_word_num]+" found");
        textbox.value = "";
        current_word_num++;
        setNewWordToType();
    }
    else {
        //Handling when a word is partially typed
        let spanArray = document.getElementById('word_to_type').querySelectorAll('span');
        let inputArray = document.getElementById('typing_box').value.split('');
        spanArray.forEach((characterSpan, index) => {
            let character = inputArray[index];
            if (character == null) {
                //console.log('nothing!');
                characterSpan.classList.remove('correct');
                characterSpan.classList.remove('incorrect');
            }
            else if (character == characterSpan.innerText) {
                //console.log('true!');
                characterSpan.classList.add('correct');
                characterSpan.classList.remove('incorrect');
            }
            else {
                //console.log('not true!');
                characterSpan.classList.remove('correct');
                characterSpan.classList.add('incorrect');
                //If the text is red, they must've goofed!
                incrementError();
            }
        });
    }

    //Handling game ending
    if (current_word_num==body_words.length && !ended) {
        console.log('done!');
        ended = true;
        endGame();
    }
}

function setNewWordToType() {
    //Handling game ending (just in case)
    if (current_word_num==body_words.length && !ended) {
        console.log('done!');
        ended = true;
        endGame();
        return;
    }

    failed_current_word = false;
    document.getElementById('word_to_type').innerHTML = "";
    current_word = body_words[current_word_num];
    current_word.split("").forEach((character, index) => {
        let characterSpan = document.createElement('span');
        characterSpan.id = "WordToType_span"+index;
        characterSpan.innerText = character;
        document.getElementById('word_to_type').appendChild(characterSpan);
    })
}

function incrementError() {
    if (!failed_current_word) {
        failed_current_word = true;
        mistakes++;
        playSound(4);
    }
}

function playSound(sfx) {
    if (!sfx_mute) {
        switch (sfx) {
            case 4:
                error_sfx.play();
                break;
            case 3:
                countdown_3.play();
                break;
            case 2:
                countdown_2.play();
                break;
            case 1:
                countdown_1.play();
                break;
            case 0:
                lucky_sfx.play();
        }
    }
}

function toggleMute() {
    sfx_mute = !sfx_mute;
    if (sfx_mute) {
        document.getElementById('mute_toggle').innerHTML = "SFX: OFF";
    }
    else {
        document.getElementById('mute_toggle').innerHTML = "SFX: ON";
    }
}

function getWPM() {
    let words_typed = body_words.length;
    let minutes_past = (Math.floor(final_time/1000))/60;
    return (words_typed/minutes_past).toFixed(2);
}
