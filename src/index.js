import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Deck extends React.Component {
  render() {
    const src = this.props.isEmpty? "cards/blank_card.svg" : "cards/astronaut.svg";
    return <img
              src={src}
              onClick={() => this.props.clickHandler()}
              width="50px"
              alt=""
            />;
  }
}

function convertCardToUrl(rank, suit) {
  return "cards/" + suit + "_" + rank + ".svg";
}


class Card extends React.Component {
  render() {
    let location;
    if (this.props.showBack) {
      location = "cards/astronaut.svg";
    }
    else if (this.props.rank && this.props.suit) {
      location = convertCardToUrl(this.props.rank, this.props.suit);
      
    }
    else {
      location = "cards/blank_card.svg";
    }

    if (this.props.clickHandler) {
      return <img
                src={location}
                width="50px"
                onClick={() => this.props.clickHandler()}
                alt=""
              />;
    }
    else {
      return <img
                src={location}
                width="50px"
                alt=""
              />;
    }
  }
}

function makeDeck() {
  const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10',
                  'jack', 'queen', 'king', 'ace'];
  let ans = [];
  for (const s of suits) {
    for (const r of ranks) {
      ans.push( {rank: r, suit: s});
    }
  }
  return ans;
}

function shuffleDeck(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


class CardGrid extends React.Component {
  renderCard(i) {
    return (
      <Card
        rank={this.props.cardLayout[i].rank}
        suit={this.props.cardLayout[i].suit}
        clickHandler={() => this.props.clickHandler(i)}
      />
    );
  }

  getLineScores(indices, maxes, step) {
    var scores = [];
    for (let ind = 0 ; ind < 5 ; ind++) {

      let startIndex = indices[ind];
      let maxIndex = maxes[ind];
      // get non null cards in row.
      let lineCards = [];
      for(let i = startIndex; i < maxIndex; i += step) {
        if (this.props.cardLayout[i].rank) {
          lineCards.push(this.props.cardLayout[i]);
        }
      }
      // Get score for them.
      let score = 0;
      if (lineCards.length > 1) {
        score = scoreHand(lineCards);
      }
      scores.push(score);
    }
    return scores;
  }

  getRowScores() {
    return this.getLineScores([0, 5, 10, 15, 20],
                              [5, 10, 15, 20, 25], 
                              1);
  }

  getColumnScores() {
    return this.getLineScores([0, 1, 2, 3, 4],
                              [25, 25, 25, 25, 25], 
                              5);
  }


  render() {
    let rowScores = this.getRowScores();
    let columnScores = this.getColumnScores();
    const columnScoreTotal = columnScores.reduce((x,y)=>x+y, 0);
    const rowScoreTotal = rowScores.reduce((x,y)=>x+y, 0);


    let topRowElements = [];
    let wholeRows = [];
    // first row is next card and then the column scores.
    if(this.props.nextCard) {
      topRowElements.push((<td>
                            <Card 
                                rank={this.props.nextCard.rank}
                                suit={this.props.nextCard.suit}
                            />
                          </td>));
    }
    else {
      topRowElements.push((<td>
        <Deck 
            isEmpty={false}
            clickHandler={() => {this.props.resetCallback(rowScoreTotal, columnScoreTotal)}}
        />
      </td>));
    }
    for(const colScore of columnScores) {
      topRowElements.push(<td><span align="center">{colScore}</span></td>);
    }
    topRowElements.push(<td>
                          <span
                            align="center"
                            style={{'font-weight': 'bold',
                                    'font-size': 24}}
                          >
                            {columnScoreTotal}
                          </span>
                        </td>);
    
    wholeRows.push(React.createElement("tr", null, ...topRowElements));

    // for other rows, it is the card layout with row score in first column.
    for (let row = 0 ; row < 5; row++) {
      let rowElements = [];
      rowElements.push(<td><span align="center">{rowScores[row]}</span></td>);
      for(let cardIndex = 0 ; cardIndex < 5; cardIndex++) {
        const ind = cardIndex + 5*row;
        rowElements.push(<td>{this.renderCard(ind)}</td>);
      }
      wholeRows.push(React.createElement("tr", null, ...rowElements));
    }

    wholeRows.push(<tr><td>
      <span
        align="center"
        style={{'font-weight': 'bold',
                'font-size': 24}}
      >
        {rowScoreTotal}
      </span>
    </td></tr>);

    return React.createElement("table", null, ...wholeRows);
  }
}


class CPUMoveButton extends React.Component {
  clickHandler() {
    if (this.props.rowTurn) {
      alert("It is your turn, not the CPU.\nMake a move.");
      return;
    }

    let ans = getNextMove(this.props.cardLayout, this.props.nextCard);
    if (ans) {
      alert(`The CPU places in the following location:\nRow: ${1+ans[0]}\nCol: ${1+ans[1]}`);
      // Convert back to normal index
      const ind = ans[0]*5 + ans[1];
      this.props.moveHandler(ind);
    }
    else {
      alert("There is no move left.\nThe round is over.\nClick the deck (astronaut) to start the next round.");
    }
  }
  
  render() {
    return (<button onClick={this.clickHandler.bind(this)}>
        {"Do Next CPU Move"}
    </button>);
  }
}

class CribbageGame extends React.Component {
  constructor(props) {
    super(props);
    const deck = makeDeck();
    shuffleDeck(deck);
    //console.log("deck length:", deck.length);

    // fill center card
    let cl = Array(25).fill({rank: null, suit: null});
    cl[12] = deck[0];

    // Check who should start.
    let rowTurn = (Math.random() > 0.5);

    this.state = {
      deck: deck.slice(1, deck.length), 
      cardLayout: cl,
      rowTurn: rowTurn
    };
  }

  resetGame() {
    const deck = makeDeck();
    shuffleDeck(deck);
    console.log("deck length:", deck.length);

    // fill center card
    let cl = Array(25).fill({rank: null, suit: null});
    cl[12] = deck[0];

    this.setState({
      deck: deck.slice(1, deck.length), 
      cardLayout: cl,
      rowTurn: !this.state.rowTurn
    });
  }

  handleGridClick(i) {
    // If there is already a card there, do nothing.
    if(this.state.cardLayout[i].rank && this.state.cardLayout[i].suit) {
      return;
    }
    const newLayout = this.state.cardLayout.slice()
    newLayout[i] = this.state.deck[0];
    const newDeck = this.state.deck.slice(1, this.state.deck.length);

    this.setState({
      deck: newDeck,
      cardLayout: newLayout,
      rowTurn: !(this.state.rowTurn)
    });
  }


  render() {
    let currentCard;
    let turnText;
    //console.log(this.state.deck.length);
    if (this.state.deck.length > 27) {
      currentCard = this.state.deck[0];
      turnText = this.state.rowTurn? "P1's Turn (rows)" : " P2/CPU's Turn (columns)";
    }
    else {
      currentCard = null;
      turnText = "Round Over - click deck (astronaut) for next round";
    }
    return (
      <div>
        <h3>{turnText}</h3>
        <br/>
        <CardGrid
          nextCard={currentCard}
          cardLayout={this.state.cardLayout}
          clickHandler={(i) => this.handleGridClick(i)}
          resetCallback={(r,c) => {this.resetGame(); this.props.resetCallback(r,c)}}
        />
        <br/>
        <CPUMoveButton
          nextCard={currentCard}
          cardLayout={this.state.cardLayout}
          moveHandler={(i) => this.handleGridClick(i)}
          rowTurn={this.state.rowTurn}
        />
      </div>
    );
  }
}

class MultiRoundCribbageGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rowScoreboard: 0,
      colScoreboard: 0,
    }
  }

  updateScore(rScore, cScore) {
    let msg;
    if (rScore > cScore) {
      rScore = rScore - cScore;
      cScore = 0;
      msg = "P1 (Row) Wins: " + rScore + " points";;
    }
    else if (cScore > rScore) {
      cScore = cScore - rScore;
      rScore = 0;
      msg = "P2/CPU (Col) Wins: " + cScore + " points";
    }
    else { //tie
      msg = "Tie!";
      cScore = 0;
      rScore = 0;
    }

    alert(msg);
    this.setState({rowScoreboard: this.state.rowScoreboard+rScore,
                   colScoreboard: this.state.colScoreboard+cScore});
  }


  render() {
    const rowScoreString = "P1 Score (Row): " + this.state.rowScoreboard;
    const colScoreString = "P2/CPU Score (Col): " + this.state.colScoreboard;
    return (<div>
              <h2>{rowScoreString}</h2>
              <h2>{colScoreString}</h2>
              <CribbageGame resetCallback={(r, c) => this.updateScore(r, c)} />
            </div>);
  }
}



// ========================================

ReactDOM.render(
  <MultiRoundCribbageGame />,
  document.getElementById('root')
);

// var testHand = [{rank: '5', suit: 'spades'},
//                 {rank: 'king', suit: 'spades'},
//                 {rank: 'queen', suit: 'spades'},
//                 {rank: 'king', suit: 'spades'},
//                 {rank: 'jack', suit: 'clubs'},];

// console.log("Hand:", testHand);
// console.log("Score 15: ", score15(testHand));
// console.log("Score Pair: ", scorePairs(testHand));
// console.log("Score Run: ", scoreRuns(testHand));
// console.log("Score Flush: ", scoreFlush(testHand));

// ========================================


function convertRankToNumber(r) {
  const d = {
    'ace': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    'jack': 11,
    'queen': 12,
    'king': 13
  }
  return d[r];
}

function scorePairs(hand) {
  if (hand.length < 2) {
    return 0;
  }
  var score = 0;
  for (let i = 0 ; i < hand.length ; i++) {
    for (let j = i+1 ; j < hand.length ; j++) {
      if (hand[i].rank === hand[j].rank) {
        score += 2;
      }
    }
  }
  return score;
}

function scoreFlush(hand) {
  if (hand.length < 5) {
    return 0;
  }
  if(hand[0].suit === hand[1].suit && 
    hand[0].suit === hand[2].suit &&
    hand[0].suit === hand[3].suit &&
    hand[0].suit === hand[4].suit) {
      return 5;
  }
  return 0;
}


function score15(hand) {
  const numbers = hand.map( (x) => Math.min(10, convertRankToNumber(x.rank)));
  const getAllSubsets = 
      theArray => theArray.reduce(
        (subsets, value) => subsets.concat(
         subsets.map(set => [value,...set])
        ),
        [[]]
      );
  const subsets = getAllSubsets(numbers);
  var score = 0;
  for (const s of subsets) {
    if(s.length > 0) {
      const sumValue = s.reduce((a, b) => a+b, 0);
      if (sumValue === 15) {
        score += 2;
      }
    }
  }
  return score;
}

function scoreRuns(hand) {
  // Get all numerical ranks in order.
  let numbers = hand.map( (x) => convertRankToNumber(x.rank));
  numbers.sort(function(a, b){return a-b});
  numbers.push(1000); // for the following loop to be easy.

  //console.log(numbers);

  // Go through and see if we have runs.
  var score  = 0;
  var duplicity = 1;
  var currentLength = 1;
  var multiple = 1;
  for (let i = 1 ; i < numbers.length ; i++) {
    const current = numbers[i], prev = numbers[i-1];
    const delta = current - prev;
    //console.log(i, duplicity, currentLength, multiple);
    if (delta === 0) {
      duplicity += 1;
    }
    else if (delta === 1) {
      multiple *= duplicity;
      duplicity = 1;
      currentLength += 1;
    }
    else { // broken sequence
      if (currentLength > 2) {
        score += (currentLength * multiple * duplicity);
      }
      currentLength = 1;
      duplicity = 1;
      multiple = 1;
    }
  }
  return score;
}


function scoreHand(hand) {
  var score = 0;

  score += score15(hand);
  score += scoreFlush(hand);
  score += scorePairs(hand);
  score += scoreRuns(hand);

  return score;
}

//=========================================================================
//===========================CPU NEXT MOVE LOGIC===========================
//=========================================================================

// Load the required ratings JSON file.
let cardRatings = require('./ratings.json');

function convertLayoutToGrid(cardLayout) {
  let ans = [];
  for (let i = 0 ; i < 5 ; i++) {
    let row = [];
    for (let j = 0 ; j < 5 ; j++) {
      row.push(cardLayout[i*5+j]);
    }
    ans.push(row);
  }
  return ans;
}

function getCardRatings(subset) {
  let realCards = [];
  for (const s of subset) {
    if (s.rank && s.suit) {
      realCards.push(s);
    }
  }

  if (realCards.length === 5) {
    return scoreHand(realCards);
  }
  else if (realCards.length === 0) {
    return cardRatings["0"];
  }
  else {
    // Convert to numbers and sort into ascending order.
    let numbers = realCards.map((x) => convertRankToNumber(x.rank));
    numbers.sort((a, b) => a - b);
    // Convert to an ID.
    let handId = 0;
    for (const n of numbers) {
      handId *= 14;
      handId += n;
    }
    return cardRatings[String(handId)];
  }
}

function getRowRating(array2d, rowInd) {
  return getCardRatings(array2d[rowInd]);
}

function getColRating(array2d, colInd) {
  let col = [];
  for (let row = 0 ; row < array2d.length ; row++) {
    col.push(array2d[row][colInd]);
  }
  return getCardRatings(col);
}

// eslint-disable-next-line
function getNextMove(cardLayout, nextCard) {

  let array2d = convertLayoutToGrid(cardLayout);

  // iterate through array, trying to place the card at each null spot and get changed rating for row and col
  // keeping track of "max" indices.
  let maxScoreDiff = -Infinity;
  let maxScoreIndices = [];

  for (let row = 0 ; row < 5 ; row++) {
    for (let col = 0 ; col < 5 ; col ++) {
      // If spot filled, skip past it. Can't place here.
      if (array2d[row][col].rank) {
        continue;
      }
      
      // check the value of placing the card at each position in the grid.
      let baselineRowRating = getRowRating(array2d, row);
      let baselineColRating = getColRating(array2d, col);

      // place the card into this spot.
      array2d[row][col] = nextCard;

      // calculate new score
      let newRowRating = getRowRating(array2d, row);
      let newColRating = getColRating(array2d, col);
      
      // Put null card back in.
      array2d[row][col] = {rank: null, suit: null};

      // check score differential.
      let scoreDiff = (newColRating - newRowRating) - (baselineColRating - baselineRowRating);
      
      console.log(`Checking: (${row}, ${col}). Diff: ${scoreDiff}`);

      if(Math.abs(scoreDiff - maxScoreDiff) <= 1e-2) {
        maxScoreIndices.push([row, col]);
      }
      else if (scoreDiff > maxScoreDiff) {
        maxScoreIndices = [[row, col]];
        maxScoreDiff = scoreDiff;
      }
    }
  }
  // return index to place next card at by choosing one of the max indices randomly.
  if (maxScoreIndices.length === 0) {
    return null;
  }
  let indexToReturn = Math.floor(Math.random() * maxScoreIndices.length);
  console.log(`Best Count: ${maxScoreIndices.length}, Chose: ${indexToReturn}`);
  return maxScoreIndices[indexToReturn];
}
