function isLegalPos(x, y, size) {
  return x >= 0 && y >= 0 && x < size && y < size;
}

function islegal(x,y,offset,size) {
  for (let k = 0; k < offset.length; k++) {
	  const nx = x + offset[k][0];
	  const ny = y + offset[k][1];
	  if (!isLegalPos(nx,ny,size)){
		  return false;
	  }
  }
  return true;
}

class Square extends React.Component {
  render() {
    const { value, isOccupied, iswinner } = this.props;
    const className = `square ${iswinner ? "winner" : ""} ${
      isOccupied ? "occupied" : ""
    }`;
    return React.createElement(
      "button",
      { className: className, onClick: () => this.props.onClick() },
      this.props.value
    );
  }
}

class Board extends React.Component {
  renderSquare(i,j) {
    const { squares, onClick, winner, winInd, occupied } = this.props;
	const iswinner = winInd && winInd.some(([x,y]) => i==x && j==y);
    return React.createElement(Square, {
	  key: `square-${i}-${j}`,
      value: squares[i][j],
      isOccupied: occupied[i][j],
      iswinner: iswinner,
      onClick: () => {
        onClick(i,j);
      }
    });
  }

  render() {
    const { occupied } = this.props;
	let len = occupied.length;
	let rows = [];
	for (let i = 0; i<len; i++){
		const row = [];
		for (let j = 0; j<len; j++){
			row.push(this.renderSquare(i,j));
		}
		rows.push(React.createElement('div', { key: i, className: 'board-row' }, row));
	}
	return React.createElement('div', null, rows);
		{/*
    return React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { className: "board-row" },
        this.renderSquare(0),
        this.renderSquare(1),
        this.renderSquare(2)
      ),

      React.createElement(
        "div",
        { className: "board-row" },
        this.renderSquare(3),
        this.renderSquare(4),
        this.renderSquare(5)
      ),

      React.createElement(
        "div",
        { className: "board-row" },
        this.renderSquare(6),
        this.renderSquare(7),
        this.renderSquare(8)
      )
    );
	*/}
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
	const boardSize = 5;
    this.state = {
      xIsNext: true,
      winner: null,
      winInd: null,
	  boardSize:boardSize,
	  minSize:3,
	  maxSize:10,
      occupied: Array.from({ length: boardSize }, () => Array(boardSize).fill(false)),
      history: [
        {
          squares: Array.from({ length: boardSize }, () => Array(boardSize).fill(null))
        }
      ]
    };
  }
    
  handleBoardSizeChange(size){
	console.log("size:",size);
	this.setState({
      xIsNext: true,
      winner: null,
      winInd: null,
	  boardSize:size,
      occupied: Array.from({ length: size }, () => Array(size).fill(false)),
      history: [
        {
          squares: Array.from({ length: size }, () => Array(size).fill(null))
        }
      ]
    });	
  }


	async vibrate(x, y) {
		console.log("vibrate:",x,y);
	  return new Promise((resolve) => {
		let occupied = this.state.occupied.map((row) => row.map((cell) => cell));
		occupied[x][y] = true;
		this.setState({ occupied: occupied });

		setTimeout(() => {
		  occupied = this.state.occupied.map((row) => row.map((cell) => cell));
		  occupied[x][y] = false;
		  this.setState({ occupied: occupied });
		  resolve(); // Resolve the promise when the vibration is complete
		}, 100);
	  });
	}
  
  calcWinner(squares,x,y) {
    const seqs = [
	  [[-2,0],[-1,0],[0,0]],
	  [[-1,0],[0,0],[1,0]],
	  [[0,0],[1,0],[2,0]],
	  [[0,-2],[0,-1],[0,0]],
	  [[0,-1],[0,0],[0,1]],
	  [[0,0],[0,1],[0,2]],
	  [[-2,-2],[-1,-1],[0,0]],
	  [[-1,-1],[0,0],[1,1]],
	  [[0,0],[1,1],[2,2]],
	  [[2,-2],[1,-1],[0,0]],
	  [[1,-1],[0,0],[-1,1]],
	  [[0,0],[-1,1],[-2,2]]
    ];

    for (let i = 0; i < seqs.length; i++) {
	  if(!islegal(x,y,seqs[i],squares.length))
		  continue;
      const [a, b, c] = seqs[i].map(([x1,y1])=>[x+x1,y+y1]);
      if (
        squares[a[0]][a[1]] &&
        squares[a[0]][a[1]] === squares[b[0]][b[1]] &&
        squares[a[0]][a[1]] === squares[c[0]][c[1]]
      ) {
        return { winner: squares[a[0]][a[1]], winInd: [a, b, c] };
      }
    }
    return { winner: null, winInd: null };
  }
  async handleClick(x,y) {
    const his = this.state.history;
    const cur = his[his.length - 1];
    if (cur.squares[x][y] || this.state.winner) {
      await this.vibrate(x,y);
      return;
    }
	const squares = cur.squares.map(row => row.map(cell => cell));
    squares[x][y] = this.state.xIsNext ? "X" : "O";
    let { winner, winInd } = this.calcWinner(squares,x,y);
    this.setState({
      history: his.concat([{ squares: squares }]),
      xIsNext: !this.state.xIsNext,
      winner: winner,
      winInd: winInd
    });
  }

  jumpTo(step) {
    this.setState({
      winner: null,
      winInd: null,
      history: this.state.history.slice(0, step + 1),
      xIsNext: step % 2 === 0
    });
  }
	componentDidUpdate(prevProps, prevState) {
		const { winner } = this.state;
		if (winner && !prevState.winner) {
			console.log("componentDidUpdate");
		  const gameBoardElement = document.querySelector(".game-board");
		  gameBoardElement.classList.remove("victory");
		  void gameBoardElement.offsetWidth;
		  gameBoardElement.classList.add("victory");
		}
	}
  render() {
	const gameName = "Tic Tac Toe";
    let status;
    const { winner, winInd, xIsNext, occupied,boardSize,minSize,maxSize } = this.state;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      status = "Next player: " + (xIsNext ? "X" : "O");
    }
    const his = this.state.history;
    const cur = his[his.length - 1];
    const moves = his.map((n, i) => {
      if (i === his.length - 1) {
        return null;
      }
      const desc = i ? "Go to step #" + i : "Go to game start";
      return /*#__PURE__*/ React.createElement(
        "li",
        { key: "li" + i } /*#__PURE__*/,
        React.createElement(
          "button",
          { className: "move-button", onClick: () => this.jumpTo(i) },
          desc
        )
      );
    });
	const n = maxSize-minSize+1;
	const boardSizeOptions = Array.from({ length: n }, (_, index) => index + minSize);
	
    return React.createElement(
      "div",
      { className: "game" },
		React.createElement(
		"div",
		{ className: "game-inner" },
		React.createElement("div",{ className: "game-name" },gameName),
		React.createElement(
		"div",
		{ className: "game-controls" },
			React.createElement("label",null,"Board Size:"),
			React.createElement(
				"select",
				{
				  value: boardSize,
				  onChange: (e) => this.handleBoardSizeChange(parseInt(e.target.value, 10))
				},
				boardSizeOptions.map((size) => React.createElement("option", { key: size, value: size }, size))
			),
			React.createElement("div",{ className: "game-next" },status)
		),
		  React.createElement(
			"div",
			{ className: "game-board" },
			React.createElement(Board, {
			  squares: cur.squares,
			  occupied: occupied,
			  xIsNext: xIsNext,
			  winInd: winInd,
			  boardSize: boardSize,
			  onClick: (x,y) => this.handleClick(x,y)
			})
		  ),
		  React.createElement(
			"div",
			{ className: "game-steps" },
			React.createElement("ol", null, moves)
		  )
	   ) 
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(Game, null));
	