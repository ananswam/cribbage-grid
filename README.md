# Game

This is a 5x5 grid version of the card game cribbage. Try it out [here!](https://ananswam.github.io/cribbage-grid)

## Rules

You are P1 and the CPU is P2. You take turns placing the next card in the deck (shown at the top left) onto the 5x5 grid, by simply clicking on the space that you would like to place the card into. On the CPU's turn, you can click the button at the bottom to do the next CPU move, which will make it your turn again.

Each round of the game consists of filling up the 5x5 grid with cards. At the end of the round, whoever has more points gets the difference added to their total points at the top, while the loser gets zero. Another round then begins.

Scoring is as follows. You, the row player, get points for the hands made up of each row of the grid. This is done according to standard cribbage rules. The CPU opponent gets points for each column of the grid. These hand totals are shown next to each row and column as the game progresses, and the large bold numbers show the totals for all rows (bottom left) and for all columns (top right).

## Cribbage Scoring

### Pairs

A pair of cards is worth 2 points (e.g. two kings). A three of a kind contains 3 pairs, and is thus worth 6 points. A 4 of a kind contains 6 pairs (4 choose 2) and is worth 12 points.

### Fifteens

Any combination of cards in your hand that adds up to 15 is worth 2 points (Ace = 1, JQK are 10 each). This makes the 5 very valuable because a lot of cards are worth 10. For example, a hand with A445J would have 3 fifteens: A4J, A4J with the other 4, and 5J. A hand of 66993 would have 5 fifteens: 4 possible versions of 69, and 663.

### Flush

Having all 5 cards of the same suit is worth 5 points.

### Runs
Having a run of cards (consecutive in rank) of length at least 3 is worth points equal to the length of the run. Ace here is low, and can only go with A23. AKQ is not allowed. For example 23456 has a run of length 5 for 5 points. 23445 has two runs of length 4 (depending on which 4 is used), so it has 8 points of runs. 33455 can 4 possible runs of length 3 (using either 3 and either 5), so it has 12 points of runs.


# Playing Card Images

Playing card images are in the public domain and available here: https://tekeye.uk/playing_cards/svg-playing-cards
Published by dan@tekeye.uk

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
