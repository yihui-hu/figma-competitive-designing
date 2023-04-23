/**
 * This file contains the main body of code that sets up, initiates and
 * clears the playing area of the associated Figma community file:
 * TODO: LINK TO FIGMA COMMUNITY FILE HERE
 */

import * as Timer from "./timer";
import * as Node from "./node";

console.clear();

// Show the HTML page for the plugin as designed in ui.html
figma.showUI(__html__, { height: 385 });

// Retrieve saved settings from Figma's clientStorage, if they exist
async function getStorage() {
  const arena_url = await figma.clientStorage.getAsync("arena_url");
  const players = await figma.clientStorage.getAsync("players");
  const memo_time = await figma.clientStorage.getAsync("memo_time");
  const playtime = await figma.clientStorage.getAsync("playtime");
  const storage = {
    arena_url: arena_url,
    players: players,
    memo_time: memo_time,
    playtime: playtime,
  };
  figma.ui.postMessage({ type: "storage", storage: storage });
}
getStorage();

// For optimizing node traversals later on
figma.skipInvisibleInstanceChildren = true;

// Initialize default Are.na API URL
const ARENA_API_BASE_URL = "https://api.are.na/v2";

// Listen to messages posted from Figma UI
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

// Set up play area and initiate game
async function playGame(msg: any) {
  // Get user params
  const memotime = msg.memotime * 1000;
  const memotime_text = msg.memotime_text;
  const playtime = msg.playtime * 1000;
  const playtime_text = msg.playtime_text;
  const num_players = parseInt(msg.num_players);
  const channelURL = msg.url.split("/");
  const channelSlug = channelURL[channelURL.length - 1];

  // Save settings (i.e. set storage) according to user params
  await figma.clientStorage.setAsync("players", msg.num_players_index);
  await figma.clientStorage.setAsync("memo_time", msg.memotime_index);
  await figma.clientStorage.setAsync("playtime", msg.playtime_index);

  const loading = figma.notify("Loading...", { timeout: Infinity });

  // Get URL to random source image from specified Are.na channel
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

    // If are.na link is valid but channel is empty, exit
    if (images.length === 0) {
      figma.ui.postMessage({ type: "error", message: "Are.na channel has no images / links." });
      loading.cancel();
      return;
    }

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

  // Main game loop
  const imageNode = figma.createImageAsync(source_img).then(async (image: Image) => {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });

    for (let i = 1; i < num_players + 1; i++) {
      // Create initial frames for source img, canvas and timers
      const source_img = Node.createSourceImage(image, i);
      const canvas = Node.createCanvas(i);
      const countdowntimer = Node.createTimer("countdowntimer", "Starting in: ",
                                              "0:05", "right", i);
      Timer.start(countdowntimer, "Starting in: ");
      src_imgs.push(source_img);
      canvases.push(canvas);
      countdowntimers.push(countdowntimer);

      loading.cancel();
    }

    // Remove countdown timer & create memo timers after countdown
    setTimeout(() => {
      for (const src_img of src_imgs) { src_img.visible = true; }
      for (const node of countdowntimers) { node.remove(); }

      for (let i = 1; i < num_players + 1; i++) {
        const memotimer = Node.createTimer("countdowntimer", "Time left: ",
                                            memotime_text, "right", i);
        Timer.start(memotimer, "Time left: ");
        memotimers.push(memotimer);
      }
    }, 5000);

    // Hide source images, remove memo timers & create playtime timers
    setTimeout(() => {
      for (const src_img of src_imgs) { src_img.visible = false; }
      for (const node of memotimers) { node.remove(); }

      for (let i = 1; i < num_players + 1; i++) {
        const playtimer = Node.createTimer("playtimer", "Time left: ",
                                            playtime_text, "left", i);
        Timer.start(playtimer, "Time left: ");
        playtimers.push(playtimer);
      }
    }, memotime + 5000);

    // Set timeout for game duration + show source image once round ends
    setTimeout(() => {
      for (const src_img of src_imgs) { src_img.visible = true; }
      for (const playtimer of playtimers) { playtimer.remove(); }

      figma.ui.postMessage({ type: "error", message: "" });
      figma.ui.show();
    }, playtime + memotime + 5000);

  }).catch((error: any) => {
    figma.ui.postMessage({ type: "error", message: "Something went wrong." });
    console.log(error);
  });
}

// Get random page number from Are.na channel
async function getPageNumber(ARENA_API_BASE_URL: string, channelSlug: string) {
  try {
    const res = await fetch(`${ARENA_API_BASE_URL}/channels/${channelSlug}`);
    const json = await res.json();
    const pages = Math.ceil(json.length / 20);
    const page_number = Math.floor(Math.random() * pages);

    return page_number;
  } catch (err) {
    figma.ui.postMessage({ type: "error", message: "Are.na channel does not exist." });
    return;
  }
}

// Clear the board after every game (user directed action)
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
