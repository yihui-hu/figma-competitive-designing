// TO-DO:
// error handling for empty channels (just check if images array is empty)
// handle pagination
// coordinate playtime + disappearing time
// custom num of players
// save storage: are.na url, timers, etc.
// have header contain timer so when saving it you know how much time was spent on it
// same images in a row
// test private channels
// reset?

// show the HTML page as designed in ui.html
figma.showUI(__html__, { height: 450 });

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
    case "get-source":
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

  // get random image from specified are.na channel
  const channelSlug = channelURL[channelURL.length - 1];

  // enclose in try-catch block later on
  var images = [];
  try {
    const response = await fetch(
      `${ARENA_API_BASE_URL}/channels/${channelSlug}/contents`
    );
    const json = await response.json();
    images = json.contents.filter(
      (content: any) => content.class === "Image" || content.class === "Link"
    );
  } catch (err) {
    figma.ui.postMessage({ message: "Are.na channel does not exist." });
    figma.ui.resize(300, 480);
    return;
  }

  console.log(images);

  if (images.length === 0) {
    figma.ui.postMessage({ message: "Are.na channel has no images / links." });
    figma.ui.resize(300, 480);
    return;
  }

  // get random image from are.na channel
  const randomIndex = Math.floor(Math.random() * images.length);
  const source = images[randomIndex].image.large.url;

  const imageNode = figma
    .createImageAsync(source)
    .then(async (image: Image) => {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      // draw canvas + src img for each player
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

        figma.currentPage.appendChild(sourcetimer);
        playtime_timers.push(sourcetimer);

        // add canvases + src images
        figma.currentPage.appendChild(node);
        figma.currentPage.appendChild(canvas);
        src_imgs.push(node);
        canvases.push(canvas);
      }
    })
    .catch((error: any) => {
      console.log(error);
    });

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

  const source_timers = tree.findAll((node) => {
    return node.name === "source-timer";
  });

  figma.ui.hide();

  // set timer to hide src img
  setTimeout(() => {
    try {
      for (const src_img of src_imgs) {
        src_img.visible = false;
      }

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
        figma.ui.show();
      }
    } catch (err) {
      console.log(err);
    }
  }, playtime);
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
