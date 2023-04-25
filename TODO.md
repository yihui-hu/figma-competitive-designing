# Todo List

## Design & UI/UX

- [x] About modal
- [x] Styled error messages
- [x] Select number of players via clicking player headshots
- [x] Clear board notification using figma.notify()
- [x] Make window size constant
- [x] Hide / show templates based on player count
- [ ] Figma community file
- [ ] Design Play & Archive pages default state

## Functionality

- [x] Error handling for empty & private channels
- [x] Show timer while playing
- [x] Sync timing with appearance / disappearance of images & canvas
- [x] Handle pagination with Are.na API
- [x] Implement 5 second timer before game starts
- [x] Coordinate timing for starting + memorization + play time
- [x] Implement clientStorage to save user settings
    - [x] Better coordinate storage syncing with UI
- [x] Attach node creation to template layers
- [x] Store page count in clientStorage to reduce fetch requests
- [ ] Clear -> Reset Board (reset Play + Archive page)

## Bugs

- [ ] Fix grouping issue when plugin is open in another page other than Play

## Features

- [x] Ability to specify custom Are.na channel
- [x] Specify amount of time for each phase of the game
- [x] Specify number of players
- [x] Clear board (user directed / when new round begins)
- [x] Automatically archive rounds to new page

## Documentation / Code

- [x] Webpack bundling
- [x] Tags in GitHub repo
- [ ] Complete README
- [ ] Remove console.logs
- [ ] Reduce / remove magic numbers
- [ ] Clean up CSS
    - [ ] Minify CSS
    - [ ] Consolidate CSS in css/styles.css
- [ ] Modularize code with webpack
- [ ] Standardize variable names

##  To check / think about:

- [ ] Custom fonts in Figma (IBM Plex Mono, etc.)
- [ ] Pages missing templates etc; default behaviour when users press play
- [ ] Organization of rounds in Archive page
- [ ] Finalize timings for memorization and play time
