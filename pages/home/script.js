document.getElementsByTagName("input")[0].value = [
  'Time', 'Past', 'Future', 'Dev',
  'Fly', 'Flying', 'Soar', 'Soaring', 'Power', 'Falling',
  'Fall', 'Jump', 'Cliff', 'Mountain', 'Rend', 'Red', 'Blue',
  'Green', 'Yellow', 'Gold', 'Demon', 'Demonic', 'Panda', 'Cat',
  'Kitty', 'Kitten', 'Zero', 'Memory', 'Trooper', 'XX', 'Bandit',
  'Fear', 'Light', 'Glow', 'Tread', 'Deep', 'Deeper', 'Deepest',
  'Mine', 'Your', 'Worst', 'Enemy', 'Hostile', 'Force', 'Video',
  'Game', 'Donkey', 'Mule', 'Colt', 'Cult', 'Cultist', 'Magnum',
  'Gun', 'Assault', 'Recon', 'Trap', 'Trapper', 'Redeem', 'Code',
  'Script', 'Writer', 'Near', 'Close', 'Open', 'Cube', 'Circle',
  'Geo', 'Genome', 'Germ', 'Spaz', 'Shot', 'Echo', 'Beta', 'Alpha',
  'Gamma', 'Omega', 'Seal', 'Squid', 'Money', 'Cash', 'Lord', 'King',
  'Duke', 'Rest', 'Fire', 'Flame', 'Morrow', 'Break', 'Breaker', 'Numb',
  'Ice', 'Cold', 'Rotten', 'Sick', 'Sickly', 'Janitor', 'Camel', 'Rooster',
  'Sand', 'Desert', 'Dessert', 'Hurdle', 'Racer', 'Eraser', 'Erase', 'Big',
  'Small', 'Short', 'Tall', 'Sith', 'Bounty', 'Hunter', 'Cracked', 'Broken',
  'Sad', 'Happy', 'Joy', 'Joyful', 'Crimson', 'Destiny', 'Deceit', 'Lies',
  'Lie', 'Honest', 'Destined', 'Bloxxer', 'Hawk', 'Eagle', 'Hawker', 'Walker',
  'Zombie', 'Sarge', 'Capt', 'Captain', 'Punch', 'One', 'Two', 'Uno', 'Slice',
  'Slash', 'Melt', 'Melted', 'Melting', 'Fell', 'Wolf', 'Hound',
  'Legacy', 'Sharp', 'Dead', 'Mew', 'Chuckle', 'Bubba', 'Bubble', 'Sandwich', 'Smasher', 'Extreme', 'Multi', 'Universe', 'Ultimate', 'Death', 'Ready', 'Monkey', 'Elevator', 'Wrench', 'Grease', 'Head', 'Theme', 'Grand', 'Cool', 'Kid', 'Boy', 'Girl', 'Vortex', 'Paradox'
][Math.floor(Math.random() * 174)];
let playerStyleParameters = [Math.floor(Math.random() * 5), Math.floor(Math.random() * 15), Math.floor(Math.random() * 15)];
document.getElementsByTagName("img")[1].src = "https://api.dicebear.com/6.x/fun-emoji/svg?backgroundColor=" + ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"][playerStyleParameters[0]] + "&eyes=" + ["closed", "closed2", "crying", "cute", "glasses", "love", "pissed", "plain", "sad", "shades", "sleepClose", "stars", "tearDrop", "wink", "wink2"][playerStyleParameters[1]] + "&mouth=" + ["cute", "drip", "faceMask", "kissHeart", "lilSmile", "pissed", "plain", "sad", "shout", "shy", "sick", "smileLol", "smileTeeth", "tongueOut", "wideSmile"][playerStyleParameters[2]];
let currentSlideShowCount = 1;
setInterval(() => {
  document.getElementsByClassName("gameContainer")[4].children[1].src = "/public/steps/step" + (currentSlideShowCount + 1) + ".gif";
  document.getElementsByClassName("gameContainer")[4].children[2].innerText = (currentSlideShowCount + 1).toString() + ". " + ["When it's your turn, choose a word you want to draw!", "Try to draw your choosen word! No spelling!", "Let other players try to guess your drawn word!", "When it's not your turn, try to guess what other players are drawing!", "Score the most points and be crowned the winner at the end!"][currentSlideShowCount];
  currentSlideShowCount = (currentSlideShowCount > 3) ? 0 : (currentSlideShowCount + 1);
}, 4000);

Array.from(document.getElementsByClassName("gameContainer")[1].children[0].children).forEach((arrow, index) => {
  arrow.addEventListener("click", () => {
    playerStyleParameters[index] = (playerStyleParameters[index] < 1) ? [4, 14, 14][index] : (playerStyleParameters[index] - 1);
    document.getElementsByTagName("img")[1].src = "https://api.dicebear.com/6.x/fun-emoji/svg?backgroundColor=" + ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"][playerStyleParameters[0]] + "&eyes=" + ["closed", "closed2", "crying", "cute", "glasses", "love", "pissed", "plain", "sad", "shades", "sleepClose", "stars", "tearDrop", "wink", "wink2"][playerStyleParameters[1]] + "&mouth=" + ["cute", "drip", "faceMask", "kissHeart", "lilSmile", "pissed", "plain", "sad", "shout", "shy", "sick", "smileLol", "smileTeeth", "tongueOut", "wideSmile"][playerStyleParameters[2]];
  });
});

Array.from(document.getElementsByClassName("gameContainer")[1].children[2].children).forEach((arrow, index) => {
  arrow.addEventListener("click", () => {
    playerStyleParameters[index] = (playerStyleParameters[index] > [3, 13, 13][index]) ? 0 : (playerStyleParameters[index] + 1);
    document.getElementsByTagName("img")[1].src = "https://api.dicebear.com/6.x/fun-emoji/svg?backgroundColor=" + ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"][playerStyleParameters[0]] + "&eyes=" + ["closed", "closed2", "crying", "cute", "glasses", "love", "pissed", "plain", "sad", "shades", "sleepClose", "stars", "tearDrop", "wink", "wink2"][playerStyleParameters[1]] + "&mouth=" + ["cute", "drip", "faceMask", "kissHeart", "lilSmile", "pissed", "plain", "sad", "shout", "shy", "sick", "smileLol", "smileTeeth", "tongueOut", "wideSmile"][playerStyleParameters[2]];
  });
});

document.getElementsByClassName("gameInput")[0].addEventListener("keydown", ({ repeat, key }) => {
  if (repeat || (key !== "Enter") || (!document.getElementsByClassName("gameInput")[0].value)) return;
  let link = document.createElement("a");
  if (location.pathname.split("/")[1] === "join") {
    link.href = "/games/" + location.pathname.split("/")[2] + "?username=" + document.getElementsByClassName("gameInput")[0].value + "&playerStyle=" + JSON.stringify(playerStyleParameters);
    link.click();
  } else {
    fetch("/api/v1/games/matchMaking")
    .then((response) => response.json())
    .then(({ err, gameId }) => {
      if (err) return;
      link.href = "/games/" + gameId + "?username=" + document.getElementsByClassName("gameInput")[0].value + "&playerStyle=" + JSON.stringify(playerStyleParameters);
      link.click();
   });
  };
});
document.getElementsByClassName("gameButton")[0].addEventListener("click", () => {
  if (!document.getElementsByClassName("gameInput")[0].value) return;
  let link = document.createElement("a");
  if (location.pathname.split("/")[1] === "join") {
    link.href = "/games/" + location.pathname.split("/")[2] + "?username=" + document.getElementsByClassName("gameInput")[0].value + "&playerStyle=" + JSON.stringify(playerStyleParameters);
    link.click();
  } else {
    fetch("/api/v1/games/matchMaking")
    .then((response) => response.json())
    .then(({ err, gameId }) => {
      if (err) return;
      link.href = "/games/" + gameId + "?username=" + document.getElementsByClassName("gameInput")[0].value + "&playerStyle=" + JSON.stringify(playerStyleParameters);
      link.click();
   });
  };
});

if (!["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(navigator.platform) && !navigator.userAgent.includes("Mac") && !("ontouchend" in document)) {
  let serviceWorkerRegistration = document.createElement("script");
  serviceWorkerRegistration.setAttribute("defer", "");
  serviceWorkerRegistration.setAttribute("src", "/pages/serviceWorker.js");
  document.head.appendChild(serviceWorkerRegistration);
};