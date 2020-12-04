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
            />;
  }
}

function convertCardToUrl(rank, suit) {
  return "cards/" + suit + "_" + rank + ".svg";
}


class Card extends React.Component {
  render() {
    let location;
    if (this.props.rank && this.props.suit) {
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
              />;
    }
    else {
      return <img
                src={location}
                width="50px"
              />;
    }
  }
}

function makeDeck() {
  const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
  const ranks = ['2', '3', '4', '5', '6', '7', '9', '10',
                  'jack', 'queen', 'king', 'ace'];
  let ans = Array();
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
    var scores = Array();
    for (let ind = 0 ; ind < 5 ; ind++) {

      let startIndex = indices[ind];
      let maxIndex = maxes[ind];
      // get non null cards in row.
      let lineCards = Array();
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
    let elements = Array();
    let rowScores = this.getRowScores();
    let columnScores = this.getColumnScores();
    for (let i = 0 ; i < 25 ; i++) {
      elements.push(this.renderCard(i));
      if (i % 5 === 4) {
        const rowInd = Math.floor(i / 5);
        elements.push(<span align="center">{"  " + rowScores[rowInd]}</span>);
        elements.push(<br/>);
      }
    }

    for (let i = 0 ; i < 5 ; i++) {
      elements.push(<span align="center">{"  " + columnScores[i] + "    "}</span>);
    }

    return React.createElement("div", null, ...elements);
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

    this.state = {
      deck: deck.slice(1, deck.length), 
      cardLayout: cl
    };
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
      cardLayout: newLayout
    });
  }


  render() {
    const currentCard = this.state.deck[0];
    return (
      <div>
        <Card
            rank={currentCard.rank}
            suit={currentCard.suit}
        />
        <br/>
        <CardGrid
          cardLayout={this.state.cardLayout}
          clickHandler={(i) => this.handleGridClick(i)}
        />
      </div>
    );
  }
}



// ========================================

ReactDOM.render(
  <CribbageGame />,
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
      if (hand[i].rank == hand[j].rank) {
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
  if(hand[0].suit == hand[1].suit && 
    hand[0].suit == hand[2].suit &&
    hand[0].suit == hand[3].suit &&
    hand[0].suit == hand[4].suit) {
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
      if (sumValue == 15) {
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
    if (delta == 0) {
      duplicity += 1;
    }
    else if (delta == 1) {
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