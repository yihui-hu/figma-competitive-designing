// TO-DO:
// DONE error handling for empty channels (just check if images array is empty)
// DONE handle pagination
// DONE coordinate playtime + disappearing time
// DONE custom num of players
// DONE test private channels
// DONE reset board
// DONE sync timing (loading in images and then starting the timer... lol) 
// DONE error message styling
// DONE choose num players via clicking player images
// DONE error message
// DONE clear board message using plugin message overlay + loading message
// DONE make window size constant
// DONE make play button wider (same width as cancel)
// DONE localstorage: are.na url, timers, etc.
// what if they copy paste it??? how to avoid clearing it accidentally :p
// have header contain timer so when saving it you know how much time was spent on it
// 5 second timer before game starts
// clean up css
// upload css style to unpkg or external service
// clean up code; rename variables (memotime? etc.)
// automatically move canvases when playing for second time? hmm....... tough........ or move to another page?
// reset play area / archive area layouts (if people accidentally / maliciously move stuff around in community file?)
// webpack bundling

console.clear();

// show the HTML page for the plugin as designed in ui.html
figma.showUI(__html__, { height: 385 });

// get saved settings from storage
async function getStorage() {
  const arena_url = await figma.clientStorage.getAsync("arena_url");
  const players = await figma.clientStorage.getAsync("players");
  const memo_time = await figma.clientStorage.getAsync("memo_time");
  const playtime = await figma.clientStorage.getAsync("playtime");
  const storage = {
    arena_url: arena_url,
    players: players,
    memo_time: memo_time,
    playtime: playtime
  }
  figma.ui.postMessage({ type: "storage", storage: storage });
}
getStorage();

// for optimizing node traversals later
figma.skipInvisibleInstanceChildren = true;

// initialize default are.na API URL
const ARENA_API_BASE_URL = "https://api.are.na/v2";

// reference coordinates
const right_x = 1300, left_x = 0
function timer_y(i: number) { return 712 + (i - 1) * 1783; }
function src_canvas_y(i: number) { return 965 + (i - 1) * 1783; }

figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case "play":
      playGame(msg);
      break;
    case "clear":
      clearBoard();
      break;
    case "cancel":
      figma.closePlugin();
      break;
    default:
      figma.closePlugin();
  }
};

// set up play area and initiate game
async function playGame(msg: any) {
  // get user params
  const memotime = msg.memotime * 1000;
  const memotime_text = msg.memotime_text;
  const playtime = msg.playtime * 1000;
  const playtime_text = msg.playtime_text;
  const num_players = parseInt(msg.num_players);
  const channelURL = msg.url.split("/");
  const channelSlug = channelURL[channelURL.length - 1];

  // set storage for user params
  await figma.clientStorage.setAsync("players", msg.num_players_index);
  await figma.clientStorage.setAsync("memo_time", msg.memotime_index);
  await figma.clientStorage.setAsync("playtime", msg.playtime_index);
  
  const loading = figma.notify("Loading...", { timeout: Infinity });

  // get url to random source image from are.na channel
  var source_img: string;
  try {
    const page_number = await getPageNumber(ARENA_API_BASE_URL, channelSlug);
    const response = await fetch(
      `${ARENA_API_BASE_URL}/channels/${channelSlug}/contents?page=${page_number}`
    );
    const json = await response.json();
    const images = json.contents.filter(
      (content: any) => content.class === "Image" || content.class === "Link"
    );
    console.log(images);

    // if are.na link is valid but channel is empty, exit
    if (images.length === 0) {
      figma.ui.postMessage({ type: "error", message: "Are.na channel has no images / links." });
      loading.cancel();
      return;
    }

    // get random image from images from are.na channel
    const randomIndex = Math.floor(Math.random() * images.length);
    source_img = images[randomIndex].image.large.url;
  } catch (err) {
    figma.ui.postMessage({ type: "error", message: "Are.na channel does not exist." });
    loading.cancel();
    return;
  }

  await figma.clientStorage.setAsync("arena_url", msg.url);
  figma.ui.hide();

  const tree = figma.currentPage;
  const src_imgs = tree.findAll((node) => { return node.name === "source-img"; });
  const canvases = tree.findAll((node) => { return node.name === "canvas"; });
  const memotimers = tree.findAll((node) => { return node.name === "memotimer"; });
  const playtimers = tree.findAll((node) => { return node.name === "playtimer"; });
  const countdowntimers = tree.findAll((node) => { return node.name === "countdowntimer"; });

  // draw canvas, src img & timer(s) for each player
  const imageNode = figma.createImageAsync(source_img).then(async (image: Image) => {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });

    for (let i = 1; i < num_players + 1; i++) {
      // create src imgs
      const source_img = figma.createRectangle();
      source_img.name = "source-img";
      source_img.x = right_x;
      source_img.y = src_canvas_y(i);
      source_img.resize(1000, 1000);
      source_img.fills = [
        {
          type: "IMAGE",
          imageHash: image.hash,
          scaleMode: "FILL",
        },
      ];
      source_img.visible = false;

      // create blank canvases
      const canvas = figma.createFrame();
      canvas.name = "canvas";
      canvas.x = left_x;
      canvas.y = src_canvas_y(i);
      canvas.resize(1000, 1000);

      // create countdown timers
      const countdowntimer = figma.createText();
      countdowntimer.name = "countdowntimer";
      countdowntimer.characters = "Starting in: 0:05";
      countdowntimer.x = right_x;
      countdowntimer.y = timer_y(i);
      countdowntimer.fontSize = 100;
      countdowntimer.fills = [
        {
          blendMode: "NORMAL",
          color: { r: 1, g: 1, b: 1 },
          opacity: 1,
          type: "SOLID",
          visible: true,
        },
      ];
      start(countdowntimer, "Starting in: ");

      figma.currentPage.appendChild(countdowntimer);
      figma.currentPage.appendChild(source_img);
      figma.currentPage.appendChild(canvas);
      src_imgs.push(source_img);
      canvases.push(canvas);
      countdowntimers.push(countdowntimer);

      loading.cancel();
    }

    // set timer to remove countdown timer & create memo timers
    setTimeout(() => {
      try {
        for (const src_img of src_imgs) { src_img.visible = true; }
        for (const node of countdowntimers) { node.remove(); }

        for (let i = 1; i < num_players + 1; i++) {
          // create memo timers
          const memotimer = figma.createText();
          memotimer.name = "memotimer";
          memotimer.characters = "Disappears in: " + memotime_text;
          memotimer.x = right_x;
          memotimer.y = timer_y(i);
          memotimer.fontSize = 100;
          memotimer.fills = [
            {
              blendMode: "NORMAL",
              color: { r: 1, g: 1, b: 1 },
              opacity: 1,
              type: "SOLID",
              visible: true,
            },
          ];
          start(memotimer, "Disappears in: ");

          figma.currentPage.appendChild(memotimer);
          memotimers.push(memotimer);
        }
      } catch (err) {
        console.log(err);
      }
    }, 5000);

    // set timer to hide src img & remove memo timers + create playtime timers    
    setTimeout(() => {
      try {
        for (const src_img of src_imgs) { src_img.visible = false; }
        for (const node of memotimers) { node.remove(); }

        for (let i = 1; i < num_players + 1; i++) {
          // create timers
          const playtimer = figma.createText();
          playtimer.name = "playtimer";
          playtimer.characters = "Time left: " + playtime_text;
          playtimer.x = left_x;
          playtimer.y = timer_y(i);
          playtimer.fontSize = 100;
          playtimer.fills = [
            {
              blendMode: "NORMAL",
              color: { r: 1, g: 1, b: 1 },
              opacity: 1,
              type: "SOLID",
              visible: true,
            },
          ];
          start(playtimer, "Time left: ");

          figma.currentPage.appendChild(playtimer);
          playtimers.push(playtimer);
        }
      } catch (err) {
        console.log(err);
      }
    }, memotime + 5000);

    // set timer for game duration + show src img once round ends
    setTimeout(() => {
      try {
        for (const src_img of src_imgs) { src_img.visible = true; }
        for (const playtimer of playtimers) { playtimer.remove(); }

        figma.ui.postMessage({ type: "error", message: "" });
        figma.ui.show();
      } catch (err) {
        console.log(err);
      }
    }, playtime + memotime + 5000);
  }).catch((error: any) => {
    console.log(error);
  });
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const secondsSet = [86400, 3600, 60, 1];

function start(node: TextNode, text: string) {
  var timeString = node.characters;
  timeString = timeString.replace(text, "");
  var seconds = getRemainingSeconds(timeString);
  var template = getTemplateFromString(timeString);

  startTimer(node, seconds, template, text);
}

function getRemainingSeconds(timeString: string): number {
  var seconds = 0;
  var components = timeString.split(":");
  secondsSet.reverse();

  components.reverse().forEach((element, index) => {
    var factor = secondsSet[index];
    seconds += factor * Number(element);
  });

  secondsSet.reverse();

  return seconds;
}

function getTemplateFromString(timeString: string): string {
  var result = "";
  for (const c of timeString) {
    if (c == ":") {
      result += c;
    } else {
      result += "0";
    }
  }
  return result;
}

async function startTimer(node: TextNode, seconds: number,
  template: string, text: string) {
  await figma.loadFontAsync(node.fontName as FontName);

  var keepItRunning = true;
  var secondsToGo = seconds;
  var newText = "";

  // this loop updates all timers every second
  while (keepItRunning) {
    if (secondsToGo > 0) {
      newText = fillUpTimeStringWithTemplate(secondsToInterval(secondsToGo), template);
    } else {
      newText = "Done"
    }
    node.characters = text + newText;
    secondsToGo -= 1;
    await delay(1000);
  }
}

function secondsToInterval(seconds: number): string {
  var result = "";
  var secondsToGo = seconds;
  secondsSet.forEach((element) => {
    var count = Math.floor(secondsToGo / element);
    if (count > 0 || result.length > 0) {
      secondsToGo -= count * element;
      if (result.length > 0) {
        result += ":";
        if (count < 10) {
          result += "0";
        }
      }
      result += String(count);
    }
  })
  return result;
}

function fillUpTimeStringWithTemplate(timeString: string, template: string): string {
  const trimmedTemplate = template.substring(0, template.length - timeString.length)
  return trimmedTemplate + timeString;
}

// function to get random page number from are.na channel
async function getPageNumber(ARENA_API_BASE_URL: string, channelSlug: string) {
  try {
    const res = await fetch(`${ARENA_API_BASE_URL}/channels/${channelSlug}`);
    const json = await res.json();

    const pages = Math.ceil(json.length / 20);
    console.log("Channel has " + pages + " pages.");

    const page_number = Math.floor(Math.random() * pages);
    console.log("Selecting page number " + page_number + "...");

    return page_number;
  } catch (err) {
    figma.ui.postMessage({ type: "error", message: "Are.na channel does not exist." });
    return;
  }
}

// function to clear the board after every game (user directed action)
function clearBoard() {
  const tree = figma.currentPage;

  const nodes = tree.findAll((node) => {
    return (
      node.name === "source-img" ||
      node.name === "canvas" ||
      node.name === "playtimer" ||
      node.name === "memotimer" ||
      node.name === "countdowntimer"
    );
  });

  for (const node of nodes) {
    node.remove();
  }

  figma.notify("Board cleared ✨", { timeout: 1500, button: { text: "✕", action: () => { return true } } });
}
