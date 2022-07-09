//API REQUEST STUFF WITH MOVIE DB
//API movie database request stuff
const urlBase = 'https://api.themoviedb.org/3';
const myApiKey = '54242199b80e2f1e00b71746c172ca7f';


//fetches a list of genres from the movie database
const fetchGenres = async () => {
  try {
     const requestPath = '/genre/movie/list';
     const requestParam = `?api_key=${myApiKey}`
     const urlToFetch = urlBase + requestPath + requestParam;
     const response = await fetch(urlToFetch);
     if(response.ok) {
        const jsonResponse = await response.json();
        const genres = jsonResponse.genres;
        console.log(genres);
        return genres;
     }
  } catch(error) {
     console.log(error);
  }  
}

//takes an array of genres and makes an html option list (without rendering)
const arrayToOptionList = (arr) => {
  console.log(arr);
  let newOptionList ='<select name="genres">';
     for (item of arr) {
     newOptionList += `<option value="${item.id}">${item.name}</option>`;
  }
  return newOptionList;
}

//creates and displays an html option box from the options list and a button
const renderOptionBox = (optionsInHtml) => {
    const preParagraph = document.createElement('p');
    preParagraph.innerText = 'Which genre of movie would you like to try and guess?';
    gameContainer.appendChild(preParagraph);
    const optionBox = document.createElement('select');
    optionBox.id = 'option-box';
    optionBox.innerHTML = optionsInHtml;
    gameContainer.appendChild(optionBox);
    const selectButton = document.createElement('button');
    selectButton.id = 'select-button';
    selectButton.innerText = 'Get me a random movie!!!';
    gameContainer.appendChild(selectButton);
    selectButton.addEventListener('click', getMeAWord);
}

//takes a genre ID and returns an array of movie titles from that genre
const fetchMoviesFromGenre = async (genreId) => {
  console.log('ggds',genreId);
  try {
     const requestPath = '/discover/movie';
     const requestParam = `?api_key=${myApiKey}&with_genres=${genreId}`;
     const urlToFetch = urlBase + requestPath + requestParam;
     console.log('url',urlToFetch);
     const response = await fetch(urlToFetch);
     if(response.ok) {
        const jsonResponse = await response.json();
        console.log(jsonResponse);
        const movies = jsonResponse.results;
        console.log(movies);
        const movieTitles = [];
        const movieIds = [];
        for (movie of movies) {
           movieTitles.push(movie.title);
           movieIds.push(movie.id);
        }
        console.log(movieTitles);
        return [movieTitles, movieIds];
     };
  } catch(error) {
     console.log(error);
  }
}

//selects a random item from an array
const selectRandomMovie = ([movieArray, idArray]) => {
  const randomIndex = Math.floor(Math.random()*movieArray.length);
  const randomMovie = movieArray[randomIndex];
  const randomMovieId = idArray[randomIndex];
  console.log(randomMovie);
  console.log(randomMovieId);
  movieToGuess = randomMovie
  movieToGuessId = randomMovieId;
  //return randomMovie;
  //clearGenreSelector();
  clearPage();
  addWordToGuessToPage(randomMovie);
  generateAlphabet();
}

//looks at what's genre has been selected then runs functions to fetch and then randomly select a movie
const getMeAWord = (event) => {
    console.log(event);
    const optionBox = document.querySelector('#option-box');
    const selectedGenreId = optionBox.value;
    console.log(selectedGenreId);
    const randomMovie = fetchMoviesFromGenre(selectedGenreId)
    .then(selectRandomMovie);
    console.log(randomMovie);
}

//fetches the movie's poster for display at the end
const fetchMovieImageFilePath = async (filmId) => {
    console.log('ggds',filmId);
    try {
        const requestPath = `/movie/${filmId}/images`;
        const requestParam = `?api_key=${myApiKey}&language=en`;
        const urlToFetch = urlBase + requestPath + requestParam;
        console.log('url',urlToFetch);
        const response = await fetch(urlToFetch);
        if(response.ok) {
            const jsonResponse = await response.json();
            console.log(jsonResponse);
            const posterFilePath = jsonResponse.posters[0].file_path;
            console.log(posterFilePath);
            return posterFilePath;
        };
    } catch(error) {
        console.log(error);
    }
}

//THE HANGMAN BIT
//===============

//SETTING UP THE GAME
//clears the page for a new game


//adds the word to guess to the page
const addWordToGuessToPage = (word) => {
    const paragraph = document.createElement('p');
    paragraph.id = 'word';
    gameContainer.appendChild(paragraph);
    //paragraph = document.querySelector('#word');
    let htmlForWord = '';
    for (let i = 0; i<word.length; i++) {
        let currentCharCode = word.charCodeAt(i);
        if (currentCharCode === 32) {
            htmlForWord += `<span id="letter-${i}"> / </span>`;
        } else if(currentCharCode <65 || (currentCharCode >90 && currentCharCode <97) || currentCharCode >122 ) {
            htmlForWord += `<span id="letter-${i}"> ${word[i]} </span>`;
        } else {
            htmlForWord += `<span id="letter-${i}"> _ </span>`;
            lettersStillToGuess++;
        }
    }
    paragraph.innerHTML = htmlForWord;
}

//adds the letters to choose from to the page
const generateAlphabet = () => {
    const letterContainer = document.createElement('div');
    letterContainer.id = 'letter-container';
    letterContainer.style.display = 'grid';
    letterContainer.style.maxWidth = '30rem';
    letterContainer.style.gridTemplateColumns = 'repeat(6, 1fr)';
    letterContainer.style.gridAutoRows = '4rem';
    letterContainer.style.gap = '1rem';
    gameContainer.appendChild(letterContainer);
    for (let i = 97; i<123; i++) {
        const newLetter = document.createElement('div');
        newLetter.id = `letter-${i}`;
        newLetter.className = 'letter';
        newLetter.innerHTML = String.fromCharCode(i);
        newLetter.style.display = 'flex';
        newLetter.style.alignItems = 'center';
        newLetter.style.justifyContent = 'center'
        newLetter.style.backgroundColor = letterInitialColor;
        newLetter.style.borderRadius = '0.5rem';
        letterContainer.appendChild(newLetter);
        newLetter.addEventListener('click', letterPressed);
    }
    addLivesLeftMessage();
}

//RUNNING THE GAME
//returns the letter and the ID of the letter that was clicked
const letterPressed = (event) => {
    console.log(event.path[0].innerText);
    console.log(event.path[0].id);
    //return event.path[0].innerText;
    checkLetter(event.path[0].innerText,event.path[0].id);
}

//runs a function that takes the id and letter of the guessed letter, calls a function to check it its in the word or not
//changes the color of the letter based on if its in the word or not and removes the event listener for that letter 
const checkLetter = (letter, letterId) => {
    const returnedValue = locationOfGuessedLetters(movieToGuess, letter);
    const clickedElement = document.querySelector(`#${letterId}`);
    clickedElement.removeEventListener('click', letterPressed);
    if(!returnedValue) {
        clickedElement.style.backgroundColor = letterIncorrectColor;
        lives--;
        updateLivesLeftMessage();
    } else {
        clickedElement.style.backgroundColor = letterCorrectColor;
        revealLetter(returnedValue);
    }
}

//compares the guessed letter with the word to guess. Returns false if it's not in the word and returns an array
//containing the locations of the guessed letter if it is in the word
const locationOfGuessedLetters = (phraseToGuess,guessedLetter) => {
    const phraseInLowerCase = phraseToGuess.toLowerCase();
    const letterInLowerCase = guessedLetter.toLowerCase();
    if(!phraseInLowerCase.includes(letterInLowerCase)) return false;
    const indexOfInstances = [];
    for (let i = 0; i<phraseInLowerCase.length; i++) {
        if(phraseInLowerCase[i] === letterInLowerCase) indexOfInstances.push(i);
    }
    return(indexOfInstances);
}

//called if the letter guessed is in the word to guess and reveals them!
//also checks if the word has been fully guessed
const revealLetter = (arrayOfInstanceIndexes) => {
    const phraseToGuess = movieToGuess;
    for (let i = 0; i < arrayOfInstanceIndexes.length; i++) {
        let indexTochange = arrayOfInstanceIndexes[i];
        let letterToReveal = document.getElementById(`letter-${indexTochange}`);
        letterToReveal.innerHTML = phraseToGuess[indexTochange];
        lettersStillToGuess--;
        console.log(lettersStillToGuess);
    }
    if(lettersStillToGuess === 0) {
        console.log('ALL DONE!');
        allDone();
    }
}

//function runs when word has been fully guessed
const allDone = async () => {
    removeAlphabetEventListeners();
    const wellDoneMessage = document.createElement('h1');
    const livesLeftMessage = document.createElement('h2');
    wellDoneMessage.innerText = 'Well done! You got it!';
    livesLeftMessage.innerText = lives > 1 ? `You had ${lives} lives left!` : `You had ${lives} life left!`;
    gameContainer.appendChild(wellDoneMessage);
    await fetchMovieImageFilePath(movieToGuessId)
    .then(displayMovieImage)
    .catch(()=> {
        console.log('error with the image stuff!')
    });
    await setTimeout(()=>{
        gameContainer.appendChild(livesLeftMessage);
    }, 1000);
    await setTimeout(()=>{
        generateNewGameButton();
    }, 2000);
}

//Runs if lives run out!
const gameOver = async () => {
    removeAlphabetEventListeners();
    const gameOverMessage = document.createElement('h1');
    gameOverMessage.innerText = 'GAME OVER! You failed!';
    const actualAnswerIs = document.createElement('h2');
    actualAnswerIs.innerText = 'The movie was...';
    const theAnswer = document.createElement('h2');
    theAnswer.innerText = movieToGuess;
    gameContainer.appendChild(gameOverMessage);
    await setTimeout(()=> {
        gameContainer.appendChild(actualAnswerIs);
    },1000);
    await setTimeout(()=> {
        fetchMovieImageFilePath(movieToGuessId)
        .then(displayMovieImage)
        .catch(()=> {
            console.log('error with the image stuff!')
        });
    },3000);
    await setTimeout(()=>{
        gameContainer.appendChild(theAnswer);
        generateNewGameButton();
    }, 5000);
}   

const displayMovieImage = (filePath) => {
    const imageSize = 'w342'; //sizes w342 and w185
    const imageUrl = `http://image.tmdb.org/t/p/${imageSize}/${filePath}`
    const imageElement = document.createElement('img');
    imageElement.src = imageUrl;
    gameContainer.appendChild(imageElement);
}

//GAME STUFF - SORTING OUT THE ACTUAL RUNNING OF THE GAME
//Running the game

const generateNewGameButton = () => {
    const newGameButton = document.createElement('button');
    newGameButton.id = 'new-game-button';
    newGameButton.innerText = `Let's play a new game!`;
    gameContainer.appendChild(newGameButton);
    newGameButton.addEventListener('click', generateNewGame)
}

const generateNewGame = async () => {
    //document.body.removeChild(document.querySelector('#new-game-button'));
    clearPage();
    resetInitialValues();
    await fetchGenres()
    .then(arrayToOptionList)
    .then(renderOptionBox)
    .catch(()=>console.log('There is a problem here!'));
}

//clears the genre selctor and calls the function to generate the alphabet
const clearGenreSelector = () => {
    const optionBoxToRemove = document.querySelector('#option-box');
    const buttonToRemove = document.querySelector('#select-button');
    gameContainer.removeChild(optionBoxToRemove);
    gameContainer.removeChild(buttonToRemove);
    generateAlphabet();
}

const clearPage = () => {
    const div = gameContainer;
    while(div.firstChild) {
        div.removeChild(div.lastChild);
    }
}

const addLivesLeftMessage = () => {
    const livesLeft = document.createElement('p');
    livesLeft.id = 'lives-display';
    livesLeft.innerText = `Lives: ${lives}`;
    gameContainer.appendChild(livesLeft);
}

const updateLivesLeftMessage = () => {
    if (lives) {
        const livesLeft = document.querySelector('#lives-display');
        livesLeft.innerText = `Lives: ${lives}`;
    } else {
        gameOver();
    }
}

const removeAlphabetEventListeners = () => {
    for (let i = 97; i<123; i++) {
        const elementToRemoveListenerFrom = document.querySelector(`#letter-${i}`);
        elementToRemoveListenerFrom.removeEventListener('click', letterPressed);
    }
}

const resetInitialValues = () => {
    lettersStillToGuess = 0;
    movieToGuess;
    lives = 8;
    movieToGuess = null;
    movieToGuessId = null;
}

//initialising stuff
const gameContainer = document.querySelector('#hangman-game-conatainer');
let lettersStillToGuess = 0;
let movieToGuess;
let movieToGuessId;
let lives = 8;
const letterInitialColor = 'lightblue';
const letterCorrectColor = 'chartreuse';
const letterIncorrectColor = 'darkred';
generateNewGameButton();