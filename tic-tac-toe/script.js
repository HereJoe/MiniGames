class Square extends React.Component {
  render() {
    const { value, isOccupied } = this.props;
    const className = `square ${isOccupied ? "occupied" : ""}`;
    return /*#__PURE__*/(
      React.createElement("button", { className: className, onClick: () => this.props.onClick() },
      this.props.value));


  }}


function calcWinner(squares) {
  const seqs = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]];

  for (let i = 0; i < seqs.length; i++) {
    const [a, b, c] = seqs[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

class Board extends React.Component {
  renderSquare(i) {
    const { squares, onClick, isSquareOccupied } = this.props;
    return /*#__PURE__*/(
      React.createElement(Square, {
        value: squares[i],
        isOccupied: isSquareOccupied[i],
        onClick: () => {
          onClick(i);
        } }));


  }

  render() {
    return /*#__PURE__*/(
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { className: "board-row" },
      this.renderSquare(0),
      this.renderSquare(1),
      this.renderSquare(2)), /*#__PURE__*/

      React.createElement("div", { className: "board-row" },
      this.renderSquare(3),
      this.renderSquare(4),
      this.renderSquare(5)), /*#__PURE__*/

      React.createElement("div", { className: "board-row" },
      this.renderSquare(6),
      this.renderSquare(7),
      this.renderSquare(8))));



  }}


class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      xIsNext: true,
      winner: null,
      isSquareOccupied: Array(9).fill(false),
      history: [
      {
        squares: Array(9).fill(null) }] };



  }
  vibrate(i) {
    let isSquareOccupied = this.state.isSquareOccupied.slice();
    isSquareOccupied[i] = true;
    this.setState({ isSquareOccupied: isSquareOccupied });
    setTimeout(() => {
      isSquareOccupied = this.state.isSquareOccupied.slice();
      isSquareOccupied[i] = false;
      this.setState({ isSquareOccupied: isSquareOccupied });
    }, 100);
  }

  handleClick(i) {
    const his = this.state.history;
    const cur = his[his.length - 1];
    if (cur.squares[i] || this.state.winner) {
      this.vibrate(i);
      return;
    }

    const squares = cur.squares.slice();
    squares[i] = this.state.xIsNext ? "X" : "O";
    const winner = calcWinner(squares);
    this.setState({
      history: his.concat([
      {
        squares: squares }]),


      xIsNext: !this.state.xIsNext,
      winner: winner });

  }

  jumpTo(step) {
    this.setState({
      winner: null,
      history: this.state.history.slice(0, step + 1),
      xIsNext: step % 2 === 0 });

  }

  render() {
    let status;
    const { winner, xIsNext } = this.state;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      status = "Next player: " + (xIsNext ? "X" : "O");
    }
    if (winner) {
      const gameBoardElement = document.querySelector(".game-board");
      gameBoardElement.classList.add("victory");
    }
    const his = this.state.history;
    const cur = his[his.length - 1];
    const moves = his.map((n, i) => {
      if (i === his.length - 1) {
        return null;
      }
      const desc = i ? "Go to step #" + i : "Go to game start";
      return /*#__PURE__*/(
        React.createElement("li", { key: "li" + i }, /*#__PURE__*/
        React.createElement("button", { className: "move-button", onClick: () => this.jumpTo(i) },
        desc)));



    });
    return /*#__PURE__*/(
      React.createElement("div", { className: "game" }, /*#__PURE__*/
      React.createElement("div", { className: "game-board" }, /*#__PURE__*/
      React.createElement(Board, {
        squares: cur.squares,
        isSquareOccupied: this.state.isSquareOccupied,
        xIsNext: this.state.xIsNext,
        onClick: i => this.handleClick(i) })), /*#__PURE__*/


      React.createElement("div", { className: "game-info" }, /*#__PURE__*/
      React.createElement("div", null, status), /*#__PURE__*/
      React.createElement("ol", null, moves))));



  }}


// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render( /*#__PURE__*/React.createElement(Game, null));