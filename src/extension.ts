import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('tictactoe.startGame', () => {
		TicTacToePanel.createOrShow();
	});
	context.subscriptions.push(disposable);
}

export function deactivate() {}

class TicTacToePanel {
	static currentPanel: TicTacToePanel | undefined;
	private readonly _panel: vscode.WebviewPanel;
	private _disposables: vscode.Disposable[] = [];

	static createOrShow() {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		if (TicTacToePanel.currentPanel) {
			TicTacToePanel.currentPanel._panel.reveal(column);
			return;
		}

		const panel = vscode.window.createWebviewPanel(
			'tictactoe',
			'TicTacToe',
			column || vscode.ViewColumn.One,
			{ enableScripts: true }
		);

		TicTacToePanel.currentPanel = new TicTacToePanel(panel);
	}

	private constructor(panel: vscode.WebviewPanel) {
		this._panel = panel;
		this._panel.webview.html = this._getHtml();
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
	}

	dispose() {
		TicTacToePanel.currentPanel = undefined;
		this._panel.dispose();
		this._disposables.forEach(d => d.dispose());
		this._disposables = [];
	}

	private _getHtml(): string {
		return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TicTacToe</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #1e1e2e;
    font-family: 'Segoe UI', sans-serif;
    color: #cdd6f4;
  }
  h1 { font-size: 2rem; margin-bottom: 1rem; letter-spacing: 2px; color: #cba6f7; }
  #status {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
    min-height: 1.8rem;
    color: #a6e3a1;
    font-weight: 600;
  }
  #board {
    display: grid;
    grid-template-columns: repeat(3, 110px);
    grid-template-rows: repeat(3, 110px);
    gap: 8px;
  }
  .cell {
    background: #313244;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    user-select: none;
  }
  .cell:hover:not(.taken) { background: #45475a; transform: scale(1.04); }
  .cell.x { color: #f38ba8; }
  .cell.o { color: #89b4fa; }
  .cell.win { background: #45475a; outline: 3px solid #a6e3a1; }
  #reset {
    margin-top: 2rem;
    padding: 0.6rem 2rem;
    font-size: 1rem;
    border: none;
    border-radius: 8px;
    background: #cba6f7;
    color: #1e1e2e;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s;
  }
  #reset:hover { background: #b4befe; }
</style>
</head>
<body>
<h1>Tic Tac Toe</h1>
<div id="status">Player X's turn</div>
<div id="board">
  ${[0,1,2,3,4,5,6,7,8].map(i => `<div class="cell" data-index="${i}"></div>`).join('')}
</div>
<button id="reset">Restart</button>
<script>
  const cells = document.querySelectorAll('.cell');
  const status = document.getElementById('status');
  const resetBtn = document.getElementById('reset');

  let board = Array(9).fill('');
  let currentPlayer = 'X';
  let gameOver = false;

  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  function checkWinner() {
    for (const [a,b,c] of wins) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return [a,b,c];
      }
    }
    return null;
  }

  function handleClick(e) {
    const idx = +e.target.dataset.index;
    if (gameOver || board[idx]) return;

    board[idx] = currentPlayer;
    e.target.textContent = currentPlayer;
    e.target.classList.add('taken', currentPlayer.toLowerCase());

    const winLine = checkWinner();
    if (winLine) {
      gameOver = true;
      winLine.forEach(i => cells[i].classList.add('win'));
      status.textContent = 'Player ' + currentPlayer + ' wins! 🎉';
      status.style.color = '#f9e2af';
      return;
    }
    if (board.every(v => v)) {
      gameOver = true;
      status.textContent = "It's a draw!";
      status.style.color = '#fab387';
      return;
    }
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    status.textContent = "Player " + currentPlayer + "'s turn";
  }

  function reset() {
    board = Array(9).fill('');
    currentPlayer = 'X';
    gameOver = false;
    cells.forEach(c => {
      c.textContent = '';
      c.className = 'cell';
    });
    status.textContent = "Player X's turn";
    status.style.color = '#a6e3a1';
  }

  cells.forEach(c => c.addEventListener('click', handleClick));
  resetBtn.addEventListener('click', reset);
</script>
</body>
</html>`;
	}
}
