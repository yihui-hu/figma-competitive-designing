# Figma Competitive Designing Plugin

<img width="1552" alt="competitive_design_alpha" src="https://github.com/yihui-hu/figma-competitive-designing/assets/90987235/5ce29ca0-a7e0-4c5f-a419-cbca74198ca9">

⚠️ Currently in the process of refactoring code to use Figma's Widget API!

## What is Competitive Designing?

Given a screenshot of a design (in this case, a website), you have X amount of time to memorize it and Y amount of time to replicate it. Using online image differentiator tools, whoever's design best matches the original wins.  

This game relies heavily on your ability to not only memorize, but also parse key parts of a design, and tests your proficiency in navigating the many design tools and shortcuts that Figma has to offer.  

Stay tuned for a companion video coming soon for more info on this riveting mind sport!

## Installation:

Although this plugin is open source, and you can build / run it locally (see [Development](#development)), the preferred method of installation is through the Figma plugin community page.

## Setup & Usage:

(add screenshot of community file here)  

1. Duplicate the companion community file[^1], which will be linked here as soon as it is released.
2. Open the plugin on the ***Play*** page of the file.
3. Customize the memorization and play time, as well as number of players.
4. Optionally, provide a link to an Are.na channel for source images. Leaving it blank sets it to this [default channel](https://www.are.na/christina/competitive-design-website-repo).
5. Play on!

## Notes:

1. The plugin automatically displays a timer for each phase of the game (starting countdown, memorization time, and play time).
2. A copy of the play area and all your work will automatically be saved to the ***Archive*** page after each round.
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

## Possible Variations:
1. An Are.na channel full of diagrams
2. An Are.na channel of typography / fonts
3. Any channel with sufficient material that you think can be decently recreated in Figma! 

## Authors:
[Christina Chen](https://christinalj.com) and [Yihui Hu](https://yhhu.xyz)

## Tooling:
- HTML & CSS
- TypeScript
- Webpack

## Resources:
- Figma's [Plugin API documentation](https://www.figma.com/plugin-docs/)
- Timer logic adapted from [Figma-Timer](https://github.com/lennet/Figma-Timer)
- Styles adapted from [figma-plugin-ds](https://github.com/thomas-lowry/figma-plugin-ds)
- Project inspired by [Intro to Competitive Programming](https://www.youtube.com/watch?v=tZ5FBBnHfm4)

[^1]: The community file is mostly for helping new players familiarize themselves with the rules and get set up, but this plugin also works on a newly created Figma file if that's what you prefer.
