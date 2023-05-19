# Figma Competitive Designing Plugin

(TODO: add thumbnail image of plugin here)

## What is Competitive Designing?

Given a screenshot of a design (in this case, a website), you have X amount of time to memorize it and Y amount of time to replicate it. Using online image differentiator tools, whoever's design best matches the original wins.  

This game relies heavily on your ability to not only memorize, but also parse key parts of a design, and tests your proficiency in navigating the many design tools and shortcuts that Figma has to offer.  

Watch the [companion video](TODO: link video here) for more info on this riveting mind sport!

## Installation:

Although this plugin is open source, and you can build / run it locally (see [Development](#development)), the preferred method of installation is through the Figma plugin community page (TODO: insert link here).

## Setup & Usage:

(add screenshot of community file here)  

1. Duplicate the companion community file, which can be found here (TODO: insert link here).
2. Open the plugin on the ***Play*** page of the file.
3. Customize the memorization and play time, as well as number of players.
4. Optionally, provide a link to an Are.na channel for source images. Leaving it blank sets it to this [default channel](https://www.are.na/christina/competitive-design-website-repo).
5. Play on!

## Notes:

1. The plugin automatically displays a timer for each phase of the game (starting countdown, memorization time, and play time).
2. A copy of the play area, including all your work, will automatically be saved to the ***Archive*** page after each round.
3. Pressing Play automatically discards any work from the previous round, so there's no need to manually reset the board after each round.
4. Feel free to move the templates around the page! In settings, there's an option to preserve the layout on reset, or you can leave it unchecked to have the templates reset to their default positions each time.

## Development:
```bash
# clone project
git clone https://github.com/yihui-hu/figma-competitive-designing.git
cd figma-competitive-designing

# install dependencies
npm install

# build project
npm run build
```

We recommend reading Figma's official [Plugin QuickStart Guide](https://www.figma.com/plugin-docs/plugin-quickstart-guide) on how to run plugins locally.

## Potential Expansions:
- Custom memorization and play times
- More game modes (zen: no time limit, etc.)

## Authors:
[Christina Chen](https://christinalj.com) & [Yihui Hu](https://yhhu.xyz)

## Tooling / Resources:
- HTML & CSS
- TypeScript
- Webpack
- Timer logic adapted from [Figma-Timer](https://github.com/lennet/Figma-Timer)
- Styles adapted from [figma-plugin-ds](https://github.com/thomas-lowry/figma-plugin-ds)
- Inspired by [Intro to Competitive Programming](https://www.youtube.com/watch?v=tZ5FBBnHfm4)