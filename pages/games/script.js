const socket = io("/");

let isPainting = false;
let mutedUsers = [];
let startPoint;
let drawingSpaceCanvasDisplayState = document.getElementById("drawingSpace").children[0].style.display;
document.getElementById("drawingSpace").children[0].style.display = "block";
let offsetWidth = document.getElementById("drawingSpace").children[0].offsetWidth;
document.getElementById("drawingSpace").children[0].style.display = drawingSpaceCanvasDisplayState;
document.getElementById("drawingSpace").children[0].width = offsetWidth.toString();
document.getElementById("drawingSpace").children[0].height = offsetWidth.toString();
document.getElementById("drawingSpace").children[1].style.height = offsetWidth.toString() + "px";
document.getElementById("drawingSpace").children[2].style.height = offsetWidth.toString() + "px";
document.getElementById("drawingSpace").children[3].style.height = offsetWidth.toString() + "px";
document.getElementById("drawingSpace").children[4].style.height = offsetWidth.toString() + "px";
document.getElementById("guessingContainer").children[0].style.height = ((offsetWidth - 81) + ((document.getElementById("drawingTools").style.display === "flex") * (document.getElementById("drawingTools").offsetHeight + 7.5))).toString() + "px";
window.addEventListener("resize", () => {
  drawingSpaceCanvasDisplayState = document.getElementById("drawingSpace").children[0].style.display;
  document.getElementById("drawingSpace").children[0].style.display = "block";
  offsetWidth = document.getElementById("drawingSpace").children[0].offsetWidth;
  document.getElementById("drawingSpace").children[0].style.display = drawingSpaceCanvasDisplayState;
  document.getElementById("drawingSpace").children[0].width = offsetWidth.toString();
  document.getElementById("drawingSpace").children[0].height = offsetWidth.toString();
  document.getElementById("drawingSpace").children[1].style.height = offsetWidth.toString() + "px";
  document.getElementById("drawingSpace").children[2].style.height = offsetWidth.toString() + "px";
  document.getElementById("drawingSpace").children[3].style.height = offsetWidth.toString() + "px";
  document.getElementById("drawingSpace").children[4].style.height = offsetWidth.toString() + "px";
  document.getElementById("guessingContainer").children[0].style.height = ((offsetWidth - 81) + ((document.getElementById("drawingTools").style.display === "flex") * (document.getElementById("drawingTools").offsetHeight + 7.5))).toString() + "px";
});

document.getElementsByClassName("playerModalContent")[0].children[0].children[1].children[1].children[1].children[1].value = location.origin + "/join/" + location.pathname.split("/")[2];
socket.emit("joinGame", {
  gameId: location.pathname.split("/")[2],
  username: location.search.split("=")[1].split("&")[0].split("%20").join(" "),
  playerStyleParameters: JSON.parse(location.search.split("=")[2])
});

socket.on("newPlayerJoined", (players) => {
  players.forEach(({ userId, username, playerStyleParameters }) => {
    let playerBox = document.createElement("div");
    playerBox.className = "gameContainer";
    playerBox.style.display = "flex";
    playerBox.style.backgroundColor = "white";
    playerBox.style.height = "37.5px";
    playerBox.style.marginTop = "7.5px";
    playerBox.style.cursor = "pointer";
    playerBox.dataset.userId = userId;
    playerBox.addEventListener("click", () => {
      document.getElementsByClassName("playerModal")[0].style.display = "block";
      document.getElementsByClassName("playerModalContent")[0].children[0].children[1].children[1].children[Number(userId === socket.id)].style.display = "flex";
      document.getElementsByClassName("playerModal")[0].dataset.userId = userId;
      document.getElementsByClassName("playerModalContent")[0].children[0].children[0].innerText = username;
      document.getElementsByClassName("playerModalContent")[0].children[0].children[1].children[0].src = "https://api.dicebear.com/6.x/fun-emoji/svg?backgroundColor=" + ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"][playerStyleParameters[0]] + "&eyes=" + ["closed", "closed2", "crying", "cute", "glasses", "love", "pissed", "plain", "sad", "shades", "sleepClose", "stars", "tearDrop", "wink", "wink2"][playerStyleParameters[1]] + "&mouth=" + ["cute", "drip", "faceMask", "kissHeart", "lilSmile", "pissed", "plain", "sad", "shout", "shy", "sick", "smileLol", "smileTeeth", "tongueOut", "wideSmile"][playerStyleParameters[2]];
    });
    let playerBoxRanking = document.createElement("h4");
    playerBoxRanking.style.position = "absolute";
    playerBoxRanking.style.transform = "translateY(-20px)";
    playerBoxRanking.innerText = "#1";
    let playerBoxDataContainer = document.createElement("div");
    let playerBoxDataContainerUsername = document.createElement("h4");
    playerBoxDataContainerUsername.style.margin = "0";
    playerBoxDataContainerUsername.style.color = (userId === socket.id) ? "#4998ff" : "#000000";
    playerBoxDataContainerUsername.style.fontSize = "15px";
    playerBoxDataContainerUsername.innerText = username;
    let playerBoxDataContainerPoints = document.createElement("span");
    playerBoxDataContainerPoints.style.fontSize = "14px";
    playerBoxDataContainerPoints.innerText = "0 points";
    playerBoxDataContainerPoints.dataset.points = "0";
    let playerBoxProfilePictureContainer = document.createElement("div");
    playerBoxProfilePictureContainer.style.display = "flex";
    playerBoxProfilePictureContainer.style.justifyContent = "flex-end";
    let playerBoxProfilePicture = document.createElement("img");
    playerBoxProfilePicture.style.position = "absolute";
    playerBoxProfilePicture.style.width = "50px";
    playerBoxProfilePicture.style.borderRadius = "5px";
    playerBoxProfilePicture.style.transform = "translate(7px, -42px)";
    playerBoxProfilePicture.alt = username;
    playerBoxProfilePicture.src = "https://api.dicebear.com/6.x/fun-emoji/svg?backgroundColor=" + ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"][playerStyleParameters[0]] + "&eyes=" + ["closed", "closed2", "crying", "cute", "glasses", "love", "pissed", "plain", "sad", "shades", "sleepClose", "stars", "tearDrop", "wink", "wink2"][playerStyleParameters[1]] + "&mouth=" + ["cute", "drip", "faceMask", "kissHeart", "lilSmile", "pissed", "plain", "sad", "shout", "shy", "sick", "smileLol", "smileTeeth", "tongueOut", "wideSmile"][playerStyleParameters[2]];
    playerBoxDataContainer.appendChild(playerBoxDataContainerUsername);
    playerBoxDataContainer.appendChild(playerBoxDataContainerPoints);
    playerBoxProfilePictureContainer.appendChild(playerBoxProfilePicture);
    playerBox.appendChild(playerBoxRanking);
    playerBox.appendChild(playerBoxDataContainer);
    playerBox.appendChild(playerBoxProfilePictureContainer);
    document.body.children[2].children[0].appendChild(playerBox);
  });
  let playerJoinMessage = document.createElement("div");
  playerJoinMessage.style.backgroundColor = (document.getElementById("guessingContainer").children[0].children.length % 2) ? "#ececec" : "white";
  playerJoinMessage.style.color = "#56CE27";
  playerJoinMessage.style.padding = "6px 0";
  playerJoinMessage.innerText = players[players.length - 1].username + " joined the room!";
  document.getElementById("guessingContainer").children[0].appendChild(playerJoinMessage);
});

socket.on("adminRights", () => {
  for (let i = 0; i < 8; i++) {
    let playerAmountSelectOption = document.createElement("option");
    playerAmountSelectOption.selected = i === 1;
    playerAmountSelectOption.value = (i + 1).toString();
    playerAmountSelectOption.innerText = (i + 1).toString();
    document.getElementsByClassName("gameInput")[0].appendChild(playerAmountSelectOption);
  };
  ["15", "20", "30", "40", "50", "60", "70", "80", "90", "100", "120", "150", "180", "210", "240"].forEach((drawTime) => {
    let drawTimeSelectOption = document.createElement("option");
    drawTimeSelectOption.selected = drawTime === "80";
    drawTimeSelectOption.value = drawTime;
    drawTimeSelectOption.innerText = drawTime;
    document.getElementsByClassName("gameInput")[1].appendChild(drawTimeSelectOption);
  });
  document.getElementById("drawingSpace").children[0].style.display = "none";
  document.getElementById("drawingSpace").children[2].style.display = "none";
  document.getElementById("drawingSpace").children[1].style.display = "block";
  document.getElementById("drawingSpace").children[1].children[4].addEventListener("click", () => {
    socket.emit("activateGame", [
      {
        parameter: "rounds",
        value: Number(document.getElementById("drawingSpace").children[1].children[0].children[1].value)
      },
      {
        parameter: "drawTime",
        value: Number(document.getElementById("drawingSpace").children[1].children[1].children[1].value)
      },
      {
        parameter: "customWords",
        value: document.getElementById("drawingSpace").children[1].children[2].value.split(",").filter((customWord) => customWord)
      },
      {
        parameter: "customWordsOnly",
        value: document.getElementById("drawingSpace").children[1].children[3].children[1].checked
      }
    ]);
  });
  document.getElementsByClassName("playerModalContent")[0].children[0].children[1].children[1].children[0].children[1].style.disabled = true;
  document.getElementsByClassName("playerModalContent")[0].children[0].children[1].children[1].children[0].children[1].style.backgroundColor = "#2a51d1";
});

socket.on("currentChoiceWords", (currentChoiceWords) => {
  Array.from(document.body.children[2].children[0].children).forEach((player) => {
    player.style.backgroundColor = "white";
  });
  document.getElementsByClassName("gameContainer")[0].children[1].children[0].innerText = "Waiting...";
  document.getElementsByClassName("gameContainer")[0].children[1].children[1].innerText = "(you are choosing a word)";
  document.getElementById("drawingSpace").children[0].style.display = "none";
  document.getElementById("drawingSpace").children[1].style.display = "none";
  document.getElementById("drawingSpace").children[3].style.display = "none";
  document.getElementById("drawingSpace").children[2].style.display = "block";
  currentChoiceWords.forEach((currentChoiceWord, index) => {
    document.getElementById("drawingSpace").children[2].children[0].children[index].innerText = currentChoiceWord;
  });
});

socket.on("currentWordChooser", (currentWordChooser) => {
  Array.from(document.body.children[2].children[0].children).forEach((player) => {
    player.style.backgroundColor = "white";
  });
  document.getElementById("drawingSpace").children[3].style.display = "none";
  document.getElementById("drawingSpace").children[0].style.display = "block";
  document.getElementsByClassName("gameContainer")[0].children[1].children[1].innerText = "(" + Array.from(document.body.children[2].children[0].children).find((player) => player.dataset.userId === currentWordChooser).children[1].children[0].innerText + " is choosing a word)";
});

socket.on("drawTimeCount", (drawTimeCount) => {
  document.getElementsByClassName("gameContainer")[0].children[0].children[0].innerText = drawTimeCount;
});

socket.on("drawingEnd", ({ correctWord, playerPointGains }) => {
  document.getElementById("drawingSpace").children[0].style.display = "none";
  document.getElementById("drawingSpace").children[3].style.display = "flex";
  document.getElementsByClassName("gameContainer")[0].children[1].children[0].innerText = "Waiting...";
  document.getElementById("drawingTools").style.display = "none";
  document.getElementById("guessingContainer").children[0].style.height = (offsetWidth - 81).toString() + "px";
  document.getElementsByClassName("gameContainer")[0].children[1].children[1].innerText = "";
  document.getElementById("drawingSpace").children[3].children[0].children[0].children[0].innerText = correctWord;
  document.getElementById("drawingSpace").children[3].children[0].children[1].innerHTML = "";
  playerPointGains.forEach(({ userId, playerPointGain }) => {
    Array.from(document.body.children[2].children[0].children).find((player) => player.dataset.userId === userId).children[1].children[1].innerText = (Number(Array.from(document.body.children[2].children[0].children).find((player) => player.dataset.userId === userId).children[1].children[1].dataset.points) + playerPointGain).toString() + " points";
    Array.from(document.body.children[2].children[0].children).find((player) => player.dataset.userId === userId).children[1].children[1].dataset.points = (Number(Array.from(document.body.children[2].children[0].children).find((player) => player.dataset.userId === userId).children[1].children[1].dataset.points) + playerPointGain).toString();
    let playerPointGainContainer = document.createElement("div");
    playerPointGainContainer.style.display = "flex";
    playerPointGainContainer.style.flexDirection = "row";
    playerPointGainContainer.style.justifyContent = "flex-end";
    let playerPointGainContainerUsername = document.createElement("span");
    playerPointGainContainerUsername.style.marginRight = "auto";
    playerPointGainContainerUsername.innerText = Array.from(document.body.children[2].children[0].children).find((player) => player.dataset.userId === userId).children[1].children[0].innerText;
    let playerPointGainContainerData = document.createElement("span");
    playerPointGainContainerData.style.color = (playerPointGain) ? "#15d015" : "#d70909";
    playerPointGainContainerData.innerText = "+" + playerPointGain.toString();
    playerPointGainContainer.appendChild(playerPointGainContainerUsername);
    playerPointGainContainer.appendChild(playerPointGainContainerData);
    document.getElementById("drawingSpace").children[3].children[0].children[1].appendChild(playerPointGainContainer);
  });
  Array.from(document.body.children[2].children[0].children).sort((firstPlayer, secondPlayer) => secondPlayer.children[1].children[1].dataset.points - firstPlayer.children[1].children[1].dataset.points).forEach((player, index) => {
    player.children[0].innerText = "#" + (index + 1).toString();
  });
  let correctWordMessage = document.createElement("div");
  correctWordMessage.style.backgroundColor = (document.getElementById("guessingContainer").children[0].children.length % 2) ? "#ececec" : "white";
  correctWordMessage.style.color = "#56CE27";
  correctWordMessage.style.padding = "6px 0";
  correctWordMessage.innerText = "The word was '" + correctWord + "'";
  document.getElementById("guessingContainer").children[0].appendChild(correctWordMessage);
  document.getElementById("drawingSpace").children[0].getContext("2d").fillStyle = "#ffffff";
  document.getElementById("drawingSpace").children[0].getContext("2d").fillRect(0, 0, document.getElementById("drawingSpace").children[0].width, document.getElementById("drawingSpace").children[0].height);
  document.getElementById("drawingSpace").children[0].getContext("2d").fillStyle = "#000000";
});

socket.on("currentWord", (currentWord) => {
  let currentDrawerMessage = document.createElement("div");
  currentDrawerMessage.style.backgroundColor = (document.getElementById("guessingContainer").children[0].children.length % 2) ? "#ececec" : "white";
  currentDrawerMessage.style.color = "#3975CE";
  currentDrawerMessage.style.padding = "6px 0";
  currentDrawerMessage.innerText = "You are drawing now!";
  document.getElementById("guessingContainer").children[0].appendChild(currentDrawerMessage);
  document.getElementsByClassName("gameContainer")[0].children[1].children[0].innerText = currentWord;
  document.getElementsByClassName("gameContainer")[0].children[1].children[1].innerText = "(you are drawing)";
  document.getElementById("drawingTools").children[0].value = "#000000";
  document.getElementById("drawingTools").children[1].value = "5";
  document.getElementById("drawingSpace").children[0].getContext("2d").lineWidth = 6;
  document.getElementById("drawingSpace").children[0].getContext("2d").fillStyle = "#ffffff";
  document.getElementById("drawingSpace").children[0].getContext("2d").fillRect(0, 0, document.getElementById("drawingSpace").children[0].width, document.getElementById("drawingSpace").children[0].height);
  document.getElementById("drawingSpace").children[0].getContext("2d").strokeStyle = "#000000";
  document.getElementById("drawingSpace").children[0].getContext("2d").fillStyle = "#000000";
  document.getElementById("drawingSpace").children[0].style.display = "block";
  document.getElementById("drawingSpace").children[1].style.display = "none";
  document.getElementById("drawingSpace").children[2].style.display = "none";
  document.getElementById("drawingSpace").children[3].style.display = "none";
  document.getElementById("drawingTools").style.display = "flex";
  document.getElementById("drawingTools").children[0].value = "#000000";
  document.getElementById("drawingTools").children[1].children[2].selected = true;
  document.getElementById("guessingContainer").children[0].style.height = ((offsetWidth - 73.5) + document.getElementById("drawingTools").offsetHeight).toString() + "px";
});

socket.on("currentWordLetters", (wordHints) => {
  document.getElementsByClassName("gameContainer")[0].children[1].children[0].innerText = wordHints.join("");
});

socket.on("currentDrawer", (currentDrawer) => {
  let currentDrawerMessage = document.createElement("div");
  currentDrawerMessage.style.backgroundColor = (document.getElementById("guessingContainer").children[0].children.length % 2) ? "#ececec" : "white";
  currentDrawerMessage.style.color = "#3975CE";
  currentDrawerMessage.style.padding = "6px 0";
  currentDrawerMessage.innerText = Array.from(document.body.children[2].children[0].children).find((player) => player.dataset.userId === currentDrawer).children[1].children[0].innerText + " is drawing now!";
  document.getElementById("guessingContainer").children[0].appendChild(currentDrawerMessage);
  document.getElementsByClassName("gameContainer")[0].children[1].children[1].innerText = "(" + Array.from(document.body.children[2].children[0].children).find((player) => player.dataset.userId === currentDrawer).children[1].children[0].innerText + " is drawing)";
});

socket.on("wordGuess", ({ author, word }) => {
  let playerWordGuessMessage = document.createElement("div");
  playerWordGuessMessage.style.padding = "6px 0";
  if (word[0]) {
    Array.from(document.body.children[2].children[0].children).find((player) => player.dataset.userId === author).style.backgroundColor = "#5bdd4a";
    playerWordGuessMessage.style.backgroundColor = "#cfffbd";
    playerWordGuessMessage.style.color = "#56CE27";
    playerWordGuessMessage.innerText = Array.from(document.body.children[2].children[0].children).find((player) => player.dataset.userId === author).children[1].children[0].innerText + " guessed the word";
    if (word[1]) document.getElementsByClassName("gameContainer")[0].children[1].children[0].innerText = word[1];
  } else {
    if (mutedUsers.includes(author)) return;
    let playerWordGuessMessageAuthor = document.createElement("span");
    playerWordGuessMessageAuthor.style.fontWeight = "bold";
    playerWordGuessMessage.style.backgroundColor = (document.getElementById("guessingContainer").children[0].children.length % 2) ? "#ececec" : "white";
    playerWordGuessMessageAuthor.innerText = Array.from(document.body.children[2].children[0].children).find((player) => player.dataset.userId === author).children[1].children[0].innerText + ": ";
    let playerWordGuessMessageData = document.createElement("span");
    playerWordGuessMessageData.innerText = word[1];
    playerWordGuessMessage.appendChild(playerWordGuessMessageAuthor);
    playerWordGuessMessage.appendChild(playerWordGuessMessageData);
  };
  document.getElementById("guessingContainer").children[0].appendChild(playerWordGuessMessage);
});

socket.on("playerLeave", (leftPlayer) => {
  let playerLeaveMessage = document.createElement("div");
  playerLeaveMessage.style.backgroundColor = (document.getElementById("guessingContainer").children[0].children.length % 2) ? "#ececec" : "white";
  playerLeaveMessage.style.color = "#ce4f0a";
  playerLeaveMessage.style.padding = "6px 0";
  playerLeaveMessage.innerText = Array.from(document.body.children[2].children[0].children).find((player) => player.dataset.userId === leftPlayer).children[1].children[0].innerText + " left the room!";
  document.getElementById("guessingContainer").children[0].appendChild(playerLeaveMessage);
  Array.from(document.body.children[2].children[0].children).find((player) => player.dataset.userId === leftPlayer).remove();
  if (leftPlayer === document.getElementsByClassName("playerModal")[0].dataset.userId) {
    document.getElementsByClassName("playerModal")[0].style.display = "none";
    document.getElementsByClassName("playerModalContent")[0].children[0].children[1].children[1].children[0].style.display = "none";
    document.getElementsByClassName("playerModalContent")[0].children[0].children[1].children[1].children[1].style.display = "none";
  };
});

Array.from(document.getElementById("drawingSpace").children[2].children[0].children).forEach((choiceWordButton, index) => {
  choiceWordButton.addEventListener("click", () => {
    let currentDrawerMessage = document.createElement("div");
    currentDrawerMessage.style.backgroundColor = (document.getElementById("guessingContainer").children[0].children.length % 2) ? "#ececec" : "white";
    currentDrawerMessage.style.color = "#3975CE";
    currentDrawerMessage.style.padding = "6px 0";
    currentDrawerMessage.innerText = "You are drawing now!";
    document.getElementsByClassName("gameContainer")[0].children[1].children[0].innerText = choiceWordButton.innerText;
    document.getElementsByClassName("gameContainer")[0].children[1].children[1].innerText = "(you are drawing)";
    document.getElementById("drawingTools").children[0].value = "#000000";
    document.getElementById("drawingTools").children[1].value = "5";
    document.getElementById("drawingSpace").children[0].getContext("2d").lineWidth = 6;
    document.getElementById("drawingSpace").children[0].getContext("2d").fillStyle = "#ffffff";
    document.getElementById("drawingSpace").children[0].getContext("2d").fillRect(0, 0, document.getElementById("drawingSpace").children[0].width, document.getElementById("drawingSpace").children[0].height);
    document.getElementById("drawingSpace").children[0].getContext("2d").strokeStyle = "#000000";
    document.getElementById("drawingSpace").children[0].getContext("2d").fillStyle = "#000000";
    document.getElementById("drawingSpace").children[0].style.display = "block";
    document.getElementById("drawingSpace").children[1].style.display = "none";
    document.getElementById("drawingSpace").children[2].style.display = "none";
    document.getElementById("drawingTools").style.display = "flex";
    document.getElementById("drawingTools").children[0].value = "#000000";
    document.getElementById("drawingTools").children[1].children[2].selected = true;
    document.getElementById("guessingContainer").children[0].style.height = ((offsetWidth - 73.5) + document.getElementById("drawingTools").offsetHeight).toString() + "px";
    socket.emit("chooseWord", index);
  });
});

socket.on("drawLine", ({ lineColor, lineWidth, lineCoordinates }) => {
  let ctx = document.getElementById("drawingSpace").children[0].getContext("2d");
  ctx.lineCap = "round";
  ctx.strokeStyle = lineColor;
  ctx.fillStyle = lineColor;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(document.getElementById("drawingSpace").children[0].width * lineCoordinates.startPoint.x, document.getElementById("drawingSpace").children[0].height * lineCoordinates.startPoint.y);
  ctx.lineTo(document.getElementById("drawingSpace").children[0].width * lineCoordinates.endPoint.x, document.getElementById("drawingSpace").children[0].height * lineCoordinates.endPoint.y);
  ctx.stroke();
});

socket.on("gameEnd", () => {
  let gameEndWinnerMessage = document.createElement("div");
  gameEndWinnerMessage.style.backgroundColor = (document.getElementById("guessingContainer").children[0].children.length % 2) ? "#ececec" : "white";
  gameEndWinnerMessage.style.color = "#ffa844";
  gameEndWinnerMessage.style.padding = "6px 0";
  gameEndWinnerMessage.innerText = document.getElementsByClassName("gameContainer")[0].children[1].children[1].innerText = Array.from(document.body.children[2].children[0].children).sort((firstPlayer, secondPlayer) => secondPlayer.children[1].children[1].dataset.points - firstPlayer.children[1].children[1].dataset.points)[0].children[1].children[0].innerText + " won with a score of " + Array.from(document.body.children[2].children[0].children).sort((firstPlayer, secondPlayer) => secondPlayer.children[1].children[1].dataset.points - firstPlayer.children[1].children[1].dataset.points)[0].children[1].children[1].dataset.points + "!";
  document.getElementById("guessingContainer").children[0].appendChild(gameEndWinnerMessage);
  document.getElementById("drawingSpace").children[3].style.display = "none";
  document.getElementById("drawingSpace").children[4].style.display = "flex";
  Array.from(document.body.children[2].children[0].children).sort((firstPlayer, secondPlayer) => secondPlayer.children[1].children[1].dataset.points - firstPlayer.children[1].children[1].dataset.points).forEach((player, index) => {
    if (index < 2) {
      ((!index) ? document.getElementById("drawingSpace").children[4].children[0].children[1].children[0].children[0].children[0].children[0].children[0] : document.getElementById("drawingSpace").children[4].children[0].children[1].children[0].children[1].children[0].children[0].children[0]).src = player.children[2].children[0].src;
      ((!index) ? document.getElementById("drawingSpace").children[4].children[0].children[1].children[0].children[0].children[0].children[1] : document.getElementById("drawingSpace").children[4].children[0].children[1].children[0].children[1].children[0].children[1]).innerText = player.children[1].children[0].innerText;
    } else {
      let gameEndPlayerContainer = document.createElement("div");
      gameEndPlayerContainer.style.marginLeft = "15px";
      let gameEndPlayerContainerData = document.createElement("div");
      let gameEndPlayerContainerDataImage = document.createElement("img");
      gameEndPlayerContainerDataImage.style.width = "5vw";
      gameEndPlayerContainerDataImage.style.borderRadius = "5px";
      gameEndPlayerContainerDataImage.src = player.children[2].children[0].src;
      let gameEndPlayerContainerDataRanking = document.createElement("span");
      gameEndPlayerContainerDataRanking.style.padding = "0 0 0 5px";
      gameEndPlayerContainerDataRanking.style.fontSize = "17.5px";
      gameEndPlayerContainerDataRanking.style.color = (index === 2) ? "#7d4924" : "#ffffff";
      gameEndPlayerContainerDataRanking.innerText = "#" + (index + 1).toString();
      let gameEndPlayerContainerUsername = document.createElement("span");
      gameEndPlayerContainerUsername.style.display = "flex";
      gameEndPlayerContainerUsername.style.fontSize = "15px";
      gameEndPlayerContainerUsername.innerText = player.children[1].children[0].innerText;
      gameEndPlayerContainerData.appendChild(gameEndPlayerContainerDataImage);
      gameEndPlayerContainerData.appendChild(gameEndPlayerContainerDataRanking);
      gameEndPlayerContainer.appendChild(gameEndPlayerContainerData);
      gameEndPlayerContainer.appendChild(gameEndPlayerContainerUsername);
      document.getElementById("drawingSpace").children[4].children[0].children[1].children[0].children[1].appendChild(gameEndPlayerContainer);
    };
  });
});

socket.on("deleteDrawing", () => {
  document.getElementById("drawingSpace").children[0].getContext("2d").fillStyle = "#ffffff";
  document.getElementById("drawingSpace").children[0].getContext("2d").fillRect(0, 0, document.getElementById("drawingSpace").children[0].width, document.getElementById("drawingSpace").children[0].height);
  document.getElementById("drawingSpace").children[0].getContext("2d").fillStyle = "#000000";
});

document.getElementById("guessingContainer").children[1].addEventListener("keydown", ({ repeat, key }) => {
  if (repeat || (key !== "Enter") || (!document.getElementById("guessingContainer").children[1].value)) return;
  socket.emit("guessWord", document.getElementById("guessingContainer").children[1].value);
  document.getElementById("guessingContainer").children[1].value = "";
});

document.getElementById("guessingContainer").children[2].addEventListener("click", () => {
  if (!document.getElementById("guessingContainer").children[1].value) return;
  socket.emit("guessWord", document.getElementById("guessingContainer").children[1].value);
  document.getElementById("guessingContainer").children[1].value = "";
});

window.addEventListener("resize", () => {
  let bufferCanvas = document.createElement("canvas");
  bufferCanvas.getContext("2d").drawImage(document.getElementById("drawingSpace").children[0], 0, 0);
  document.getElementById("drawingSpace").children[0].getContext("2d").drawImage(bufferCanvas, 0, 0);
});

document.getElementById("drawingSpace").children[0].addEventListener("mousedown", ({ clientX, clientY }) => {
  if (document.getElementById("drawingTools").style.display === "none") return;
  isPainting = true;
  document.getElementById("drawingSpace").children[0].getContext("2d").beginPath();
  document.getElementById("drawingSpace").children[0].getContext("2d").moveTo(clientX - document.getElementById("drawingSpace").children[0].offsetLeft, clientY - document.getElementById("drawingSpace").children[0].offsetTop);
  startPoint = {
    x: (clientX - document.getElementById("drawingSpace").children[0].offsetLeft) / document.getElementById("drawingSpace").children[0].width,
    y: (clientY - document.getElementById("drawingSpace").children[0].offsetTop) / document.getElementById("drawingSpace").children[0].height
  };
});

document.getElementById("drawingSpace").children[0].addEventListener("touchstart", ({ touches: [{ clientX, clientY }] }) => {
  if (document.getElementById("drawingTools").style.display === "none") return;
  isPainting = true;
  document.getElementById("drawingSpace").children[0].getContext("2d").beginPath();
  document.getElementById("drawingSpace").children[0].getContext("2d").moveTo(clientX - document.getElementById("drawingSpace").children[0].offsetLeft, clientY - document.getElementById("drawingSpace").children[0].offsetTop);
  startPoint = {
    x: (clientX - document.getElementById("drawingSpace").children[0].offsetLeft) / document.getElementById("drawingSpace").children[0].width,
    y: (clientY - document.getElementById("drawingSpace").children[0].offsetTop) / document.getElementById("drawingSpace").children[0].height
  };
});

document.getElementById("drawingSpace").children[0].addEventListener("mousemove", ({ clientX, clientY }) => {
  if (!isPainting || (document.getElementById("drawingTools").style.display === "none")) return;
  let ctx = document.getElementById("drawingSpace").children[0].getContext("2d");
  ctx.lineCap = "round";
  ctx.lineTo(clientX - document.getElementById("drawingSpace").children[0].offsetLeft, clientY - document.getElementById("drawingSpace").children[0].offsetTop);
  ctx.moveTo(clientX - document.getElementById("drawingSpace").children[0].offsetLeft, clientY - document.getElementById("drawingSpace").children[0].offsetTop);
  ctx.stroke();
  socket.emit("drawLine", {
    lineColor: document.getElementById("drawingTools").children[0].value,
    lineWidth: document.getElementById("drawingTools").children[1].value,
    lineCoordinates: {
      startPoint,
      endPoint: {
        x: (clientX - document.getElementById("drawingSpace").children[0].offsetLeft) / document.getElementById("drawingSpace").children[0].width,
        y: (clientY - document.getElementById("drawingSpace").children[0].offsetTop) / document.getElementById("drawingSpace").children[0].height
      }
    }
  });
  startPoint = {
    x: (clientX - document.getElementById("drawingSpace").children[0].offsetLeft) / document.getElementById("drawingSpace").children[0].width,
    y: (clientY - document.getElementById("drawingSpace").children[0].offsetTop) / document.getElementById("drawingSpace").children[0].height
  };
});

document.getElementById("drawingSpace").children[0].addEventListener("touchmove", ({ touches: [{ clientX, clientY }] }) => {
  if (!isPainting || (document.getElementById("drawingTools").style.display === "none")) return;
  let ctx = document.getElementById("drawingSpace").children[0].getContext("2d");
  ctx.lineCap = "round";
  ctx.lineTo(clientX - document.getElementById("drawingSpace").children[0].offsetLeft, clientY - document.getElementById("drawingSpace").children[0].offsetTop);
  ctx.moveTo(clientX - document.getElementById("drawingSpace").children[0].offsetLeft, clientY - document.getElementById("drawingSpace").children[0].offsetTop);
  ctx.stroke();
  socket.emit("drawLine", {
    lineColor: document.getElementById("drawingTools").children[0].value,
    lineWidth: document.getElementById("drawingTools").children[1].value,
    lineCoordinates: {
      startPoint,
      endPoint: {
        x: (clientX - document.getElementById("drawingSpace").children[0].offsetLeft) / document.getElementById("drawingSpace").children[0].width,
        y: (clientY - document.getElementById("drawingSpace").children[0].offsetTop) / document.getElementById("drawingSpace").children[0].height
      }
    }
  });
  startPoint = {
    x: (clientX - document.getElementById("drawingSpace").children[0].offsetLeft) / document.getElementById("drawingSpace").children[0].width,
    y: (clientY - document.getElementById("drawingSpace").children[0].offsetTop) / document.getElementById("drawingSpace").children[0].height
  };
});

document.getElementById("drawingTools").children[0].addEventListener("change", () => {
  document.getElementById("drawingSpace").children[0].getContext("2d").strokeStyle = document.getElementById("drawingTools").children[0].value;
  document.getElementById("drawingSpace").children[0].getContext("2d").fillStyle = document.getElementById("drawingTools").children[0].value;
});

document.getElementById("drawingTools").children[1].addEventListener("change", () => {
  document.getElementById("drawingSpace").children[0].getContext("2d").lineWidth = document.getElementById("drawingTools").children[1].value;
});

document.getElementById("drawingTools").children[2].addEventListener("click", () => {
  document.getElementById("drawingSpace").children[0].getContext("2d").fillStyle = "#ffffff";
  document.getElementById("drawingSpace").children[0].getContext("2d").fillRect(0, 0, document.getElementById("drawingSpace").children[0].width, document.getElementById("drawingSpace").children[0].height);
  document.getElementById("drawingSpace").children[0].getContext("2d").fillStyle = "#000000";
  socket.emit("deleteDrawing");
});

window.addEventListener("mouseup", () => {
  isPainting = false;
});

window.addEventListener("touchend", () => {
  isPainting = false;
});

window.addEventListener("click", ({ target }) => {
  if (target !== document.getElementsByClassName("playerModal")[0]) return;
  document.getElementsByClassName("playerModal")[0].style.display = "none";
  document.getElementsByClassName("playerModalContent")[0].children[0].children[1].children[1].children[0].style.display = "none";
  document.getElementsByClassName("playerModalContent")[0].children[0].children[1].children[1].children[1].style.display = "none";
});

document.getElementsByClassName("playerModalContent")[0].children[1].addEventListener("click", () => {
  document.getElementsByClassName("playerModal")[0].style.display = "none";
  document.getElementsByClassName("playerModalContent")[0].children[0].children[1].children[1].children[0].style.display = "none";
  document.getElementsByClassName("playerModalContent")[0].children[0].children[1].children[1].children[1].style.display = "none";
});

document.getElementsByClassName("playerModalContent")[0].children[0].children[1].children[1].children[0].children[0].addEventListener("click", () => {
  if (mutedUsers.includes(document.getElementsByClassName("playerModal")[0].dataset.userId)) {
    document.getElementsByClassName("playerModalContent")[0].children[0].children[1].children[1].children[0].children[0].innerText = "Mute";
    mutedUsers = mutedUsers.filter((mutedUser) => mutedUser !== document.getElementsByClassName("playerModal")[0].dataset.userId);
  } else {
    document.getElementsByClassName("playerModalContent")[0].children[0].children[1].children[1].children[0].children[0].innerText = "Unmute";
    mutedUsers = [
      ...mutedUsers,
      ...[
        document.getElementsByClassName("playerModal")[0].dataset.userId
      ]
    ];
  };
});

document.getElementsByClassName("playerModalContent")[0].children[0].children[1].children[1].children[0].children[1].addEventListener("click", () => {
  socket.emit("kickUser", document.getElementsByClassName("playerModal")[0].dataset.userId);
  document.getElementsByClassName("playerModal")[0].style.display = "none";
  document.getElementsByClassName("playerModalContent")[0].children[0].children[1].children[1].children[0].style.display = "none";
    document.getElementsByClassName("playerModalContent")[0].children[0].children[1].children[1].children[1].style.display = "none";
});

document.getElementsByClassName("playerModalContent")[0].children[0].children[1].children[1].children[1].children[2].addEventListener("click", () => {
  navigator.clipboard.writeText(document.getElementsByClassName("playerModalContent")[0].children[0].children[1].children[1].children[1].children[1].value);
});

if (!["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(navigator.platform) && !navigator.userAgent.includes("Mac") && !("ontouchend" in document)) {
  let serviceWorkerRegistration = document.createElement("script");
  serviceWorkerRegistration.setAttribute("defer", "");
  serviceWorkerRegistration.setAttribute("src", "/pages/serviceWorker.js");
  document.head.appendChild(serviceWorkerRegistration);
};

history.pushState({}, "", location.href.split("?")[0]);