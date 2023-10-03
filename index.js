const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*"
  }
});
const crypto = require("crypto");
const words = require("./words.json");
let matchMakingGames = [];
let games = {};

io.on("connection", (socket, name) => {
  socket.on("joinGame", async ({ gameId, username, playerStyleParameters }) => {
    if (
      (
        (
          typeof gameId !== "string"
        ) || (
          gameId.length < 1
        )
      ) || (
        (
          typeof username !== "string"
        ) || (
          username.length < 1
        )
      ) || (
        (games[gameId] || {}).active
      )
    ) return;
    games = {
      ...{
        [gameId]: {
          ...games[gameId] || {},
          ...{
            active: false,
            currentWord: null,
            players: {
              ...(games[gameId] || {}).players || {},
              ...{
                [socket.id]: {
                  username,
                  playerStyleParameters,
                  playerPointGain: 0
                }
              }
            },
            currentChoiceWords: [],
            currentWordLetters: [],
            drawTimeCount: 0,
            drawTimeInterval: null,
            drawingCount: 0
          },
          ...(!io.sockets.adapter.rooms.get(gameId)?.size) ? {
            admin: socket.id,
            roundCount: 2,
            drawTime: 80,
            customWords: [],
            customWordsOnly: false,
            currentDrawer: socket.id
          } : {}
        }
      }
    };
    socket.join(gameId);
    socket.emit("newPlayerJoined", Object.entries(games[gameId].players).map(([userId, userData]) => ({
      ...{
        userId
      },
      ...userData
    })));
    socket.to(gameId).emit("newPlayerJoined", [
      {
        userId: socket.id,
        username,
        playerStyleParameters
      }
    ]);
    let drawTimeFunction = () => {
      games[gameId].drawingCount = games[gameId].drawingCount + 1;
      if ((games[gameId].drawingCount + 1) > (games[gameId].rounds * io.sockets.adapter.rooms.get(gameId)?.size)) {
        io.to(gameId).emit("gameEnd");
        games = Object.entries(games).filter((game) => game[0] !== gameId).reduce((data, game) => ({
          ...data,
          ...{
            [game[0]]: game[1]
          }
        }), {});
      } else {
        games[gameId].players = Object.entries(games[gameId].players).reduce((data, [userId, { username, playerStyleParameters }]) => ({
          ...data,
          ...{
            [userId]: {
              username,
              playerStyleParameters,
              playerPointGain: 0
            }
          }
        }), {});
        games[gameId].currentDrawer = Array.from(io.sockets.adapter.rooms.get(gameId))[(games[gameId].drawingCount) - (Math.floor((games[gameId].drawingCount) / io.sockets.adapter.rooms.get(gameId)?.size) * io.sockets.adapter.rooms.get(gameId)?.size)];
        games[gameId].currentChoiceWords = [[
          ...(games[gameId].customWordsOnly) ? [] : words,
          ...games[gameId].customWords.filter((customWord) => customWord) || []
        ][Math.floor(Math.random() * [
          ...(games[gameId].customWordsOnly) ? [] : words,
          ...games[gameId].customWords.filter((customWord) => customWord) || []
        ].length)], [
          ...(games[gameId].customWordsOnly) ? [] : words,
          ...games[gameId].customWords.filter((customWord) => customWord) || []
        ][Math.floor(Math.random() * [
          ...(games[gameId].customWordsOnly) ? [] : words,
          ...games[gameId].customWords.filter((customWord) => customWord) || []
        ].length)], [
          ...(games[gameId].customWordsOnly) ? [] : words,
          ...games[gameId].customWords.filter((customWord) => customWord) || []
        ][Math.floor(Math.random() * [
          ...(games[gameId].customWordsOnly) ? [] : words,
          ...games[gameId].customWords.filter((customWord) => customWord) || []
        ].length)]];
        games[gameId].currentWordLetters = [];
        games[gameId].drawTimeCount = 15;
        io.sockets.sockets.get(games[gameId].currentDrawer).emit("currentChoiceWords", games[gameId].currentChoiceWords);
        io.sockets.sockets.get(games[gameId].currentDrawer).to(gameId).emit("currentWordChooser", games[gameId].currentDrawer);
        io.to(gameId).emit("drawTimeCount", "15");
        games[gameId].drawTimeInterval = setInterval(() => {
          games[gameId].drawTimeCount = games[gameId].drawTimeCount - 1;
          io.to(gameId).emit("drawTimeCount", games[gameId].drawTimeCount.toString());
          if (!games[gameId].drawTimeCount) {
            games[gameId].currentWord = games[gameId].currentChoiceWords[Math.floor(Math.random() * 2)];
            games[gameId].currentWordLetters = Array.from(Array(games[gameId].currentWord.length)).map((_, index) => (games[gameId].currentWord[index] === " ") ? " " : "_");
            games[gameId].currentChoiceWords = [];
            games[gameId].drawTimeCount = games[gameId].drawTime;
            io.to(gameId).emit("drawTimeCount", games[gameId].drawTimeCount.toString());
            if (!(games[gameId].drawTimeCount % 20 + (Math.abs(games[gameId].currentWord.length - 8) * 5))) {
              let wordHintLetterIndex = Array.from(games[gameId].currentWord).map((wordHintLetter, index) => [wordHintLetter, index]).filter(([wordHintLetter]) => wordHintLetter !== " ")[Math.floor(Math.random() * Array.from(games[gameId].currentWord).filter((wordHintLetter) => wordHintLetter !== " ").length)][1];
              games[gameId].currentWordLetters[wordHintLetterIndex] = games[gameId].currentWord[wordHintLetterIndex];
            };
            io.sockets.sockets.get(games[gameId].currentDrawer).to(gameId).emit("currentWordLetters", games[gameId].currentWordLetters);
            io.sockets.sockets.get(games[gameId].currentDrawer).emit("currentWord", games[gameId].currentWord);
            io.sockets.sockets.get(games[gameId].currentDrawer).to(gameId).emit("currentDrawer", games[gameId].currentDrawer);
            games[gameId].drawTimeInterval = setInterval(() => {
              games[gameId].drawTimeCount = games[gameId].drawTimeCount - 1;
              io.to(gameId).emit("drawTimeCount", games[gameId].drawTimeCount.toString());
              if (!games[gameId].drawTimeCount || (Object.values(games[gameId].players).filter((player) => player.playerPointGain).length === (io.sockets.adapter.rooms.get(gameId)?.size - 1)) || !games[gameId].players[games[gameId].currentDrawer]) {
                clearInterval(games[gameId].drawTimeInterval);
                games[gameId].currentChoiceWords = [null, null, null];
                io.to(gameId).emit("drawingEnd", {
                  correctWord: games[gameId].currentWord,
                  playerPointGains: Object.entries(games[gameId].players).sort((firstPlayer, secondPlayer) => secondPlayer[1].playerPointGain - firstPlayer[1].playerPointGain).map(([userId, { playerPointGain }]) => ({
                    userId,
                    playerPointGain
                  }))
                });
                socket.to("drawTimeCount", "10");
                games[gameId].drawTimeCount = 10;
                games[gameId].drawTimeInterval = setInterval(() => {
                  games[gameId].drawTimeCount = games[gameId].drawTimeCount - 1;
                  io.to(gameId).emit("drawTimeCount", games[gameId].drawTimeCount.toString());
                  if (!games[gameId].drawTimeCount) {
                    clearInterval(games[gameId].drawTimeInterval);
                    drawTimeFunction();
                  };
                }, 1000);
              } else if (!(games[gameId].drawTimeCount % (20 + (Math.abs(games[gameId].currentWord.length - 8) * 5)))) {
                let wordHintLetterIndex = Array.from(games[gameId].currentWord).map((wordHintLetter, index) => [wordHintLetter, index]).filter(([wordHintLetter]) => wordHintLetter !== " ")[Math.floor(Math.random() * Array.from(games[gameId].currentWord).filter((wordHintLetter) => wordHintLetter !== " ").length)][1];
                games[gameId].currentWordLetters[wordHintLetterIndex] = games[gameId].currentWord[wordHintLetterIndex];
                io.sockets.sockets.get(games[gameId].currentDrawer).to(gameId).emit("currentWordLetters", games[gameId].currentWordLetters);
              };
            }, 1000);
          } else if (games[gameId].currentChoiceWords.length < 1) {
            clearInterval(games[gameId].drawTimeInterval);
          };
        }, 1000);
      };
    };
    if (io.sockets.adapter.rooms.get(gameId)?.size < 2) socket.emit("adminRights");
    socket.on("activateGame", (parameters) => {
      if (games[gameId].active || (games[gameId].admin !== socket.id) || !Array.isArray(parameters || []) || (io.sockets.adapter.rooms.get(gameId)?.size < 2) || (parameters || []).some(({ parameter }) => !["rounds", "drawTime", "customWords", "customWordsOnly"].includes(parameter)) || (parameters || []).some(({ parameter, value }) => !({
        rounds: (input) => (typeof input === "number") && (input > 0) && (input < 9),
        drawTime: (input) => [15, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 150, 180, 210, 240].includes(input),
        customWords: (input) => Array.isArray(input || []) && Array.from(new Set((input || []).map((item) => typeof item))).every((item) => item === "string"),
        customWordsOnly: (input) => typeof input === "boolean"
      })[parameter](value))) return;
      matchMakingGames = matchMakingGames.filter((matchMakingGame) => matchMakingGame !== gameId);
      parameters.forEach(({ parameter, value }) => {
        games[gameId][parameter] = value;
      });
      games[gameId].active = true;
      games[gameId].currentChoiceWords = [[
        ...(games[gameId].customWordsOnly) ? [] : words,
        ...games[gameId].customWords.filter((customWord) => customWord) || []
      ][Math.floor(Math.random() * [
        ...(games[gameId].customWordsOnly) ? [] : words,
        ...games[gameId].customWords.filter((customWord) => customWord) || []
      ].length)], [
        ...(games[gameId].customWordsOnly) ? [] : words,
        ...games[gameId].customWords.filter((customWord) => customWord) || []
      ][Math.floor(Math.random() * [
        ...(games[gameId].customWordsOnly) ? [] : words,
        ...games[gameId].customWords.filter((customWord) => customWord) || []
      ].length)], [
        ...(games[gameId].customWordsOnly) ? [] : words,
        ...games[gameId].customWords.filter((customWord) => customWord) || []
      ][Math.floor(Math.random() * [
        ...(games[gameId].customWordsOnly) ? [] : words,
        ...games[gameId].customWords.filter((customWord) => customWord) || []
      ].length)]];
      socket.emit("currentChoiceWords", games[gameId].currentChoiceWords);
      socket.to(gameId).emit("currentWordChooser", socket.id);
      io.to(gameId).emit("drawTimeCount", "15");
      games[gameId].drawTimeCount = 15;
      games[gameId].drawTimeInterval = setInterval(() => {
        games[gameId].drawTimeCount = games[gameId].drawTimeCount - 1;
        io.to(gameId).emit("drawTimeCount", games[gameId].drawTimeCount.toString());
        if (!games[gameId].drawTimeCount) {
          games[gameId].currentWord = games[gameId].currentChoiceWords[Math.floor(Math.random() * 2)];
          games[gameId].currentWordLetters = Array.from(Array(games[gameId].currentWord.length)).map((_, index) => (games[gameId].currentWord[index] === " ") ? " " : "_");
          games[gameId].currentChoiceWords = [];
          games[gameId].drawTimeCount = games[gameId].drawTime;
          io.to(gameId).emit("drawTimeCount", games[gameId].drawTimeCount.toString());
          if (!(games[gameId].drawTimeCount % 20 + (Math.abs(games[gameId].currentWord.length - 8) * 5))) {
            let wordHintLetterIndex = Array.from(games[gameId].currentWord).map((wordHintLetter, index) => [wordHintLetter, index]).filter(([wordHintLetter]) => wordHintLetter !== " ")[Math.floor(Math.random() * Array.from(games[gameId].currentWord).filter((wordHintLetter) => wordHintLetter !== " ").length)][1];
            games[gameId].currentWordLetters[wordHintLetterIndex] = games[gameId].currentWord[wordHintLetterIndex];
          };
          socket.to(gameId).emit("currentWordLetters", games[gameId].currentWordLetters);
          socket.emit("currentWord", games[gameId].currentWord);
          socket.to(gameId).emit("currentDrawer", games[gameId].currentDrawer);
          games[gameId].drawTimeInterval = setInterval(() => {
            games[gameId].drawTimeCount = games[gameId].drawTimeCount - 1;
            io.to(gameId).emit("drawTimeCount", games[gameId].drawTimeCount.toString());
            if (!games[gameId].drawTimeCount || (Object.values(games[gameId].players).filter((player) => player.playerPointGain).length === (io.sockets.adapter.rooms.get(gameId)?.size - 1)) || !games[gameId].players[games[gameId].currentDrawer]) {
              clearInterval(games[gameId].drawTimeInterval);
              games[gameId].currentChoiceWords = [null, null, null];
              io.to(gameId).emit("drawingEnd", {
                correctWord: games[gameId].currentWord,
                playerPointGains: Object.entries(games[gameId].players).sort((firstPlayer, secondPlayer) => secondPlayer[1].playerPointGain - firstPlayer[1].playerPointGain).map(([userId, { playerPointGain }]) => ({
                  userId,
                  playerPointGain
                }))
              });
              socket.to("drawTimeCount", "10");
              games[gameId].drawTimeCount = 10;
              games[gameId].drawTimeInterval = setInterval(() => {
                games[gameId].drawTimeCount = games[gameId].drawTimeCount - 1;
                io.to(gameId).emit("drawTimeCount", games[gameId].drawTimeCount.toString());
                if (!games[gameId].drawTimeCount) {
                  clearInterval(games[gameId].drawTimeInterval);
                  drawTimeFunction();
                };
              }, 1000);
            } else if (!(games[gameId].drawTimeCount % (20 + (Math.abs(games[gameId].currentWord.length - 8) * 5)))) {
              let wordHintLetterIndex = Array.from(games[gameId].currentWord).map((wordHintLetter, index) => [wordHintLetter, index]).filter(([wordHintLetter]) => wordHintLetter !== " ")[Math.floor(Math.random() * Array.from(games[gameId].currentWord).filter((wordHintLetter) => wordHintLetter !== " ").length)][1];
              games[gameId].currentWordLetters[wordHintLetterIndex] = games[gameId].currentWord[wordHintLetterIndex];
              socket.to(gameId).emit("currentWordLetters", games[gameId].currentWordLetters);
            };
          }, 1000);
        } else if (games[gameId].currentChoiceWords.length < 1) {
          clearInterval(games[gameId].drawTimeInterval);
        };
      }, 1000);
    });
    socket.on("chooseWord", (word) => {
      if (!games[gameId].active || (word < 0) || (word > 2) || (games[gameId].currentChoiceWords < 1) || (socket.id !== games[gameId].currentDrawer)) return;
      clearInterval(games[gameId].drawTimeInterval);
      games[gameId].currentWord = games[gameId].currentChoiceWords[word];
      games[gameId].currentWordLetters = Array.from(Array(games[gameId].currentWord.length)).map((_, index) => (games[gameId].currentWord[index] === " ") ? " " : "_");
      games[gameId].currentChoiceWords = [];
      games[gameId].drawTimeCount = games[gameId].drawTime;
      io.to(gameId).emit("drawTimeCount", games[gameId].drawTimeCount.toString());
      if (!(games[gameId].drawTimeCount % 20 + (Math.abs(games[gameId].currentWord.length - 8) * 5))) {
        let wordHintLetterIndex = Array.from(games[gameId].currentWord).map((wordHintLetter, index) => [wordHintLetter, index]).filter(([wordHintLetter]) => wordHintLetter !== " ")[Math.floor(Math.random() * Array.from(games[gameId].currentWord).filter((wordHintLetter) => wordHintLetter !== " ").length)][1];
        games[gameId].currentWordLetters[wordHintLetterIndex] = games[gameId].currentWord[wordHintLetterIndex];
      };
      socket.to(gameId).emit("currentWordLetters", games[gameId].currentWordLetters);
      socket.to(gameId).emit("currentDrawer", games[gameId].currentDrawer);
      games[gameId].drawTimeInterval = setInterval(() => {
        games[gameId].drawTimeCount = games[gameId].drawTimeCount - 1;
        io.to(gameId).emit("drawTimeCount", games[gameId].drawTimeCount.toString());
        if (!games[gameId].drawTimeCount || (Object.values(games[gameId].players).filter((player) => player.playerPointGain).length === (io.sockets.adapter.rooms.get(gameId)?.size - 1)) || !games[gameId].players[games[gameId].currentDrawer]) {
          clearInterval(games[gameId].drawTimeInterval);
          games[gameId].currentChoiceWords = [null, null, null];
          io.to(gameId).emit("drawingEnd", {
            correctWord: games[gameId].currentWord,
            playerPointGains: Object.entries(games[gameId].players).sort((firstPlayer, secondPlayer) => secondPlayer[1].playerPointGain - firstPlayer[1].playerPointGain).map(([userId, { playerPointGain }]) => ({
              userId,
              playerPointGain
            }))
          });
          socket.to("drawTimeCount", "10");
          games[gameId].drawTimeCount = 10;
          games[gameId].drawTimeInterval = setInterval(() => {
            games[gameId].drawTimeCount = games[gameId].drawTimeCount - 1;
            io.to(gameId).emit("drawTimeCount", games[gameId].drawTimeCount.toString());
            if (!games[gameId].drawTimeCount) {
              clearInterval(games[gameId].drawTimeInterval);
              drawTimeFunction();
            };
          }, 1000);
        } else if (!(games[gameId].drawTimeCount % (20 + (Math.abs(games[gameId].currentWord.length - 8) * 5)))) {
          let wordHintLetterIndex = Array.from(games[gameId].currentWord).map((wordHintLetter, index) => [wordHintLetter, index]).filter(([wordHintLetter]) => wordHintLetter !== " ")[Math.floor(Math.random() * Array.from(games[gameId].currentWord).filter((wordHintLetter) => wordHintLetter !== " ").length)][1];
          games[gameId].currentWordLetters[wordHintLetterIndex] = games[gameId].currentWord[wordHintLetterIndex];
          socket.to(gameId).emit("currentWordLetters", games[gameId].currentWordLetters);
        };
      }, 1000);
    });
    socket.on("guessWord", (word) => {
      if (!games[gameId].active || (games[gameId].currentChoiceWords > 0) || (socket.id === games[gameId].currentDrawer) || !word) return;
      games[gameId].players = {
        ...games[gameId].players,
        ...{
          [socket.id]: {
            ...games[gameId].players[socket.id],
            ...{
              playerPointGain: (games[gameId].currentWord === word) ? Math.floor((games[gameId].currentWord.length / 5) * 100) + Math.floor(7500 / games[gameId].drawTime - games[gameId].drawTimeCount) : 0
            }
          }
        }
      };
      socket.emit("wordGuess", {
        author: socket.id,
        word: [games[gameId].currentWord === word, word]
      });
      socket.to(gameId).emit("wordGuess", {
        author: socket.id,
        word: [games[gameId].currentWord === word, (games[gameId].currentWord !== word) ? word : null]
      });
    });
    socket.on("drawLine", ({ lineColor, lineWidth, lineCoordinates }) => {
      if (!games[gameId].active || (games[gameId].currentChoiceWords > 0) || (socket.id !== games[gameId].currentDrawer) || !/^#[0-9A-F]{6}$/i.test(lineColor) || !["2", "4", "6", "8", "10"].includes(lineWidth) || (Object.keys(lineCoordinates).length !== 2) || Object.entries(lineCoordinates).some(([lineCoordinateType, lineCoordinateValues]) => !["startPoint", "endPoint"].includes(lineCoordinateType) || (Object.keys(lineCoordinateValues).length !== 2) || Object.entries(lineCoordinateValues).some((lineCoordinate) => !["x", "y"].includes((lineCoordinate[0])) || (lineCoordinate[1] < 0) || (lineCoordinate[1] > 1)))) return;
      socket.to(gameId).emit("drawLine", {
        lineColor,
        lineWidth,
        lineCoordinates
      });
    });
    socket.on("deleteDrawing", () => {
      if (socket.id !== games[gameId].currentDrawer) return;
      socket.to(gameId).emit("deleteDrawing");
    });
    socket.on("kickUser", (kickedUser) => {
      if (games[gameId].admin !== socket.id) return;
      io.sockets.sockets.get(kickedUser)?.disconnect();
    });
  });
  socket.on("disconnecting", () => {
    let socketMeetings = Array.from(socket.rooms).slice(1);
    socketMeetings.forEach((gameId) => {
      if (Object.keys(games[gameId].players || {}).length > 1) {
        games[gameId].players = Object.entries(games[gameId].players).filter((player) => player[0] !== socket.id).reduce((data, player) => ({
          ...data,
          ...{
            [player[0]]: player[1]
          }
        }));
        socket.to(gameId).emit("playerLeave", socket.id);
      } else {
        clearInterval(games[gameId].drawTimeInterval);
        games = Object.entries(games).filter((game) => game[0] !== gameId).reduce((data, game) => ({
          ...data,
          ...{
            [game[0]]: game[1]
          }
        }), {});
      };
    });
  });
});

app.use("/public", express.static("public"))
app.use("/pages", express.static("pages"));

app.all("/", (req, res) => {
  res.sendFile("pages/home/index.html", {
    root: __dirname
  });
});

app.all("/join/:gameId", (req, res) => {
  res.sendFile("pages/home/index.html", {
    root: __dirname
  });
});

app.all("/games/:gameId", (req, res) => {
  res.sendFile("pages/games/index.html", {
    root: __dirname
  });
});

app.all("/api/v1/games/matchMaking", (req, res) => {
  if ((matchMakingGames || []).length) {
    res.json({
      err: null,
      gameId: (matchMakingGames || [])[Math.floor(Math.random() * matchMakingGames.length)]
    });
  } else {
    crypto.randomBytes(4, (err, gameId) => {
      if (err) return res.json({
        err,
        gameId: null
      });
      matchMakingGames = [
        ...matchMakingGames || [],
        ...[
          gameId.toString("hex")
        ]
      ]
      res.json({
        err: null,
        gameId: gameId.toString("hex")
      });
    });
  };
});

app.all("/manifest.json", (req, res) => {
  res.sendFile("manifest.json", {
    root: __dirname
  });
});

app.all("/serviceWorker.js", (req, res) => {
  res.sendFile("serviceWorker.js", {
    root: __dirname
  });
});

const listen = http.listen(3000, () => {
  console.log("Server is now ready on port", listen.address().port);
});