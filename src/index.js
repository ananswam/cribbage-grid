import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Fade from '@material-ui/core/Fade';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';

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



function Card(props) {
  let location;
  if (props.showBack) {
    location = "cards/astronaut.svg";
  }
  else if (props.rank && props.suit) {
    location = convertCardToUrl(props.rank, props.suit);
    
  }
  else {
    location = "cards/blank_card.svg";
  }

  let imgTag;
  if (props.clickHandler) {
    imgTag = <img
              src={location}
              width="50px"
              onClick={() => props.clickHandler()}
              alt=""
            />;
  }
  else {
    imgTag = <img
              src={location}
              width="50px"
              alt=""
            />;
  }
  return <div {...props}>{imgTag}</div>;
}

function FadeCard(props) {
  var [comeIn, setComeIn] = useState(true);
  var [oldRank, setOldRank] = useState(null);
  var [oldSuit, setOldSuit] = useState(null);

  if ((oldRank !== props.rank || oldSuit !== props.suit) && comeIn) {
    setComeIn(false);
    setOldRank(props.rank);
    setOldSuit(props.suit);
    setTimeout(() => {setComeIn(true)}, 100);
  }
  console.log(comeIn, oldRank, oldSuit, props.rank, props.suit);

  return (<Fade in={comeIn} timeout={comeIn? 1500: 0}>
      <Card {...props}/>
    </Fade>);
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
      <FadeCard
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
                            style={{fontWeight: 'bold',
                                    fontSize: 24}}
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
        style={{fontWeight: 'bold',
                fontSize: 24}}
      >
        {rowScoreTotal}
      </span>
    </td></tr>);

    return <table>{React.createElement("tbody", null, ...wholeRows)}</table>;
  }
}

class CribbageGame extends React.Component {
  constructor(props) {
    super(props);
    const deck = makeDeck();
    shuffleDeck(deck);

    // fill center card
    let cl = Array(25).fill({rank: null, suit: null});
    cl[12] = deck[0];

    // Check who should start.
    let rowTurn = true;

    this.state = {
      deck: deck.slice(1, deck.length), 
      cardLayout: cl,
      rowTurn: rowTurn,
      cpuEnabled: true,
      cpuLevel: 5
    };
  }

  resetGame() {
    const deck = makeDeck();
    shuffleDeck(deck);

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

  cpuMoveHandler(cardLayout, nextCard) {
    console.log(cardLayout, nextCard);
    let ans = getNextMove(cardLayout, nextCard, this.state.cpuLevel);
    if (ans !== null) {
      this.handleGridClick(ans);
    }
  }

  render() {
    let currentCard;
    let turnText;

    if (this.state.deck.length > 27) {
      currentCard = this.state.deck[0];
      turnText = this.state.rowTurn? "P1's Turn (rows)" : " P2/CPU's Turn (columns)";
    }
    else {
      currentCard = null;
      turnText = "Round Over - click deck (astronaut) for next round";
    }

    // Do the CPU move in a bit if it's the CPU's turn.
    if (this.state.rowTurn === false && this.state.cpuEnabled) {
      setTimeout(()=> this.cpuMoveHandler(this.state.cardLayout, currentCard), 3000);
    }

    return (
      <div>
        <h3>{turnText}</h3>
        <br/>
        <CardGrid
          nextCard={currentCard}
          cardLayout={this.state.cardLayout}
          clickHandler={(i) => {if (this.state.rowTurn || !this.state.cpuEnabled) {this.handleGridClick(i)}}}
          resetCallback={(r,c) => {this.resetGame(); this.props.resetCallback(r,c)}}
        />
        <br />
        <FormControlLabel
      control={
        <Switch checked={this.state.cpuEnabled}
                onChange={() => this.setState({cpuEnabled: !this.state.cpuEnabled})}
                name="cpuEnableSwitch" />
      }
      label="CPU Opponent"
        />
        <br />
        <div style={{width: "200px"}}>
          <Typography id="discrete-slider" gutterBottom>
            {"CPU Difficulty"}
          </Typography>
          <Slider
            defaultValue={this.state.cpuLevel}
            aria-labelledby="discrete-slider"
            valueLabelDisplay="auto"
            onChange={(e, v) => this.setState({cpuLevel: v})}
            step={1}
            marks
            min={1}
            max={10}
            disabled={!this.state.cpuEnabled}
          />
        </div>

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

function getNextMoveRatings(cardLayout, nextCard) {

  let array2d = convertLayoutToGrid(cardLayout);

  // Iterate through array tracking score and index at each spot.
  let openIndices = [];
  let netRatings = [];

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
      
      openIndices.push(row*5 + col);
      netRatings.push(scoreDiff);
    }
  }
  return [openIndices, netRatings];
}

/** Weighted soft max of values, multiply by alpha first.
 * 
 * @param {Array[number]} values 
 * @param {number} alpha 
 */
function softmax(values, alpha) {
  let ans = values.map((x) => Math.exp(x*alpha));
  let sum = ans.reduce((a,b) => a+b, 0);
  return ans.map((x) => x/sum);
}

/** Return random index according to weights in values
 * 
 * @param {Array[number]} values Must be a prob distribution.
 */
function pickIndex(values) {
  let i = 0, total=0;
  const r = Math.random();

  for (i = 0 ; i < values.length ; i++) {
    total += values[i];
    if (r < total) {
      return i;
    }
  }
  console.assert(false, "Should not reach here in weighted random sampling");
  return values.length-1;
}

function getNextMove(cardLayout, nextCard, alpha) {
  let [openIndices, netRatings] = getNextMoveRatings(cardLayout, nextCard);
  if (openIndices.length === 0) {
    return null;
  }
  let softMaxRatings = softmax(netRatings, Math.max(0, alpha-1)*10/9);
  return openIndices[pickIndex(softMaxRatings)];
}
