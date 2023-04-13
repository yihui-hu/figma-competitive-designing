// TO-DO:
// error handling for empty channels (just check if images array is empty)
// handle pagination
// coordinate playtime + disappearing time

// show the HTML page as designed in ui.html
figma.showUI(__html__, { height: 450 });

// for optimizing node traversals
figma.skipInvisibleInstanceChildren = true

// initialize are.na API URL
const ARENA_API_BASE_URL = "https://api.are.na/v2";

// coordinates for placing canvases + img_src
const src_x = 1300;
const canvas_x = 0; 
function coords_y(i: number) { return (965 + ((i - 1) * 1783)); }

// calls to "parent.postMessage" from the ui.html
// triggers the callback, which will be passed
// the "pluginMessage" property of the posted msg;
// different actions executed depending on user action
figma.ui.onmessage = async msg => {
  switch (msg.type) {
    case "cancel":
      figma.closePlugin();
    case "get-source":
      playGame(msg);
    case "clear":
      clearBoard();
  }
};

// function to set up board and initiate game
async function playGame(msg: any) {
    // get user params
    const source_time = msg.source_time * 1000;
    const playtime = msg.playtime * 1000;
    const num_players = parseInt(msg.num_players);
    const channelURL = msg.url.split("/");

    // get random image from specified are.na channel
    const channelSlug = channelURL[channelURL.length - 1];
    const response = await fetch(`${ARENA_API_BASE_URL}/channels/${channelSlug}/contents`);
    const json = await response.json();
    const images = json.contents.filter((content: any) => content.class === "Image" || content.class === "Link");

    if (images.length === 0) {
      // catch error here
    }

    // get random image from are.na channel
    const randomIndex = Math.floor(Math.random() * images.length);
    const source = images[randomIndex].image.large.url;

    const imageNode = figma.createImageAsync(
      source
    ).then(async (image: Image) => {
      // draw canvas + src img for each player
      for (let i = 1; i < num_players + 1; i++) {

        // create src imgs
        const node = figma.createRectangle()
        node.name = "source-img";
        node.x = src_x;
        node.y = coords_y(i);
        node.resize(1000, 1000);
        node.fills = [{
            type: 'IMAGE',
            imageHash: image.hash,
            scaleMode: 'FILL'
        }]

        // create blank canvases
        const canvas = figma.createFrame()
        canvas.name = "canvas";
        canvas.x = canvas_x;
        canvas.y = coords_y(i);
        canvas.resize(1000, 1000);

        // add canvases + src images
        figma.currentPage.appendChild(node);
        figma.currentPage.appendChild(canvas);
        src_imgs.push(node);
        canvases.push(canvas);
      }
    }).catch((error: any) => {
      console.log(error)
    })

    const tree = figma.currentPage;

    const src_imgs = tree.findAll(node => {
      return node.name === "source-img"
    })

    const canvases = tree.findAll(node => {
      return node.name === "canvas"
    })

    figma.ui.hide();
  
    // set timer to hide src img
    setTimeout(() => {
      try {
        for (const src_img of src_imgs) {
          src_img.visible = false;
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
          figma.closePlugin();
        }
      } catch (err) {
        console.log(err);
      }
    }, playtime);
}

// function to clear the board after every game (user directed action)
function clearBoard() {
    const tree = figma.currentPage;

    const nodes = tree.findAll(node => {
      return node.name === "source-img" || 
             node.name === "canvas" || 
             node.name === "sticky";
    })

    for (const node of nodes) {
      node.remove();
    }
}
