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
// have header contain timer so when saving it you know how much time was spent on it
// localstorage: are.na url, timers, etc.
// clear board message using plugin message overlay
// make window size constant
// make play button wider (same width as cancel)

// show the HTML page as designed in ui.html
figma.showUI(__html__, { height: 400 });

// for optimizing node traversals
figma.skipInvisibleInstanceChildren = true;

// initialize are.na API URL
const ARENA_API_BASE_URL = "https://api.are.na/v2";

// coordinates for placing canvases + img_src
const src_x = 1300, canvas_x = 0, playtimer_x = 0, sourcetimer_x = 1300;
function timer_y(i: number) {
  return 712 + (i - 1) * 1783;
}
function coords_y(i: number) {
  return 965 + (i - 1) * 1783;
}

// calls to "parent.postMessage" from the ui.html
// triggers the callback, which will be passed
// the "pluginMessage" property of the posted msg;
// different actions executed depending on user action
figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case "cancel":
      figma.closePlugin();
      break;
    case "play":
      playGame(msg);
      break;
    case "clear":
      clearBoard();
      break;
    default:
      figma.closePlugin();
  }
};

// function to set up board and initiate game
async function playGame(msg: any) {
  // get user params
  const source_time = msg.source_time * 1000;
  const source_time_text = msg.source_time_text;
  const playtime = msg.playtime * 1000;
  const playtime_text = msg.playtime_text;
  const num_players = parseInt(msg.num_players);
  const channelURL = msg.url.split("/");
  
  const channelSlug = channelURL[channelURL.length - 1];
  var images = [];

  try {
    // get random page number from are.na channel
    const page_number = await getPageNumber(ARENA_API_BASE_URL, channelSlug);

    // get images from random page from are.na channel
    const response = await fetch(
      `${ARENA_API_BASE_URL}/channels/${channelSlug}/contents?page=${page_number}`
    );
    const json = await response.json();
    images = json.contents.filter(
      (content: any) => content.class === "Image" || content.class === "Link"
    );
    console.log(images);
  } catch (err) {
    figma.ui.postMessage({ message: "Are.na channel does not exist." });
    figma.ui.resize(300, 450);
    return;
  }

  // if are.na link is valid but channel is empty
  if (images.length === 0) {
    figma.ui.postMessage({ message: "Are.na channel has no images / links." });
    figma.ui.resize(300, 450);
    return;
  }

  // get random image from images from are.na channel
  const randomIndex = Math.floor(Math.random() * images.length);
  const source = images[randomIndex].image.large.url;

  const tree = figma.currentPage;

  const src_imgs = tree.findAll((node) => {
    return node.name === "source-img";
  });

  const canvases = tree.findAll((node) => {
    return node.name === "canvas";
  });

  const playtime_timers = tree.findAll((node) => {
    return node.name === "playtime-timer";
  });

  // draw canvas, src img & timer for each player
  const imageNode = figma
    .createImageAsync(source)
    .then(async (image: Image) => {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      for (let i = 1; i < num_players + 1; i++) {
        // create src imgs
        const node = figma.createRectangle();
        node.name = "source-img";
        node.x = src_x;
        node.y = coords_y(i);
        node.resize(1000, 1000);
        node.fills = [
          {
            type: "IMAGE",
            imageHash: image.hash,
            scaleMode: "FILL",
          },
        ];

        // create blank canvases
        const canvas = figma.createFrame();
        canvas.name = "canvas";
        canvas.x = canvas_x;
        canvas.y = coords_y(i);
        canvas.resize(1000, 1000);

        // create source-img timers
        const sourcetimer = figma.createText();
        sourcetimer.name = "source-timer";
        sourcetimer.characters = "Timer: " + source_time_text;
        sourcetimer.x = sourcetimer_x;
        sourcetimer.y = timer_y(i);
        sourcetimer.fontSize = 100;
        sourcetimer.fills = [
          {
            blendMode: "NORMAL",
            color: { r: 1, g: 1, b: 1 },
            opacity: 1,
            type: "SOLID",
            visible: true,
          },
        ];

        start(sourcetimer);
        console.log("Started source timer...");

        figma.currentPage.appendChild(sourcetimer);
        playtime_timers.push(sourcetimer);

        // add canvases + src images
        figma.currentPage.appendChild(node);
        figma.currentPage.appendChild(canvas);
        src_imgs.push(node);
        canvases.push(canvas);
      }
    
      figma.ui.hide();
    
      // set timer to hide src img & src timers
    
      console.log("Setting timeout...?");
    
      setTimeout(() => {
        try {
          for (const src_img of src_imgs) {
            src_img.visible = false;
          }
    
          // remove source timers 
          const tree = figma.currentPage;
    
          const source_timers = tree.findAll((node) => {
            return node.name === "source-timer";
          });
    
          for (const node of source_timers) {
            node.remove();
          }
    
          for (let i = 1; i < num_players + 1; i++) {
            // create timers
            const playtimer = figma.createText();
            playtimer.name = "playtime-timer";
            playtimer.characters = "Timer: " + playtime_text;
            playtimer.x = playtimer_x;
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
    
            start(playtimer);
    
            figma.currentPage.appendChild(playtimer);
            playtime_timers.push(playtimer);
          }
        } catch (err) {
          console.log(err);
        }
      }, source_time);
    
      // set timer for game duration + show src img once round ends
      setTimeout(() => {
        try {
          for (const src_img of src_imgs) {
            src_img.visible = true;
            figma.ui.postMessage({ message: "" });
            figma.ui.show();
          }
        } catch (err) {
          console.log(err);
        }
      }, playtime + source_time);
    })
    .catch((error: any) => {
      console.log(error);
    });
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const secondsSet = [86400, 3600, 60, 1];

// function to start timer
function start(node: TextNode) {
  var timeString = node.characters;
  timeString = timeString.replace("Timer: ", "");

  var seconds = getRemainingSeconds(timeString);
  var template = getTemplateFromString(timeString);

  startTimer(node, seconds, template);
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
                          template: string) {
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
      node.characters = "Timer: " + newText;
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
  const temp_res = await fetch(
    `${ARENA_API_BASE_URL}/channels/${channelSlug}`
  );
  const temp_json = await temp_res.json();
  var pages = Math.ceil(temp_json.length / 20);
  console.log("Channel has " + pages + " pages.");
  var page_number = Math.floor(Math.random() * pages);
  console.log("Selecting page number " + page_number + "...");
  return page_number;
}

// function to clear the board after every game (user directed action)
function clearBoard() {
  const tree = figma.currentPage;

  const nodes = tree.findAll((node) => {
    return (
      node.name === "source-img" ||
      node.name === "canvas" ||
      node.name === "sticky" ||
      node.name === "playtime-timer" ||
      node.name === "source-timer"
    );
  });

  for (const node of nodes) {
    node.remove();
  }
}
