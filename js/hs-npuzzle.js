var dataName = 'hs-npuzzle';

document.addEventListener('DOMContentLoaded', function() {
  var hsNpuzzle = new HsNPuzzle();
});

/**
 * Main game function class.
 */
class HsNPuzzle {
  /**
   * Constructor.
   */
  constructor () {
    // Reset button event
    document.getElementById('reset').addEventListener('click', () => {
      if (confirm("Start new game?")) {
        this.reset();
      }
    });

    // Resize event
    window.addEventListener('resize', () => {
      this.resize();
    });

    this.resume();
    this.newGame();
  }

  /**
   * Get saved data to resume game.
   */
  resume() {
    this.saved = JSON.parse(localStorage.getItem(dataName));
  }

  /**
   * Start new game.
   */
  newGame() {
    if (this.saved) {
      document.getElementById('size').value = this.saved.size;
    }

    this.board = document.getElementById('board'); // Width is defined in css
    this.cols = this.rows = document.getElementById('size').value;
    this.total = this.rows * this.cols - 1; // Number of tiles == max index of a tile
    this.finishFlag = false;
    this.generateTiles();
  }

  /**
   * Generate div elements for tiles.
   */
  generateTiles() {
    // Display saved tiles
    if (this.saved) {
      this.board.innerHTML = this.saved.board;
      this.currentEmpty = this.saved.current;

    // Display new tiles
    } else {
      for (let i = 0; i < this.total; i++) {
        let tile = document.createElement('div');
        tile.setAttribute('id', i); // ID starts from 0
        tile.classList.add('tile');
        tile.innerHTML = i + 1;
        this.board.appendChild(tile);
      }
      this.currentEmpty = this.total;
    }

    this.tiles = document.getElementsByClassName('tile');
    for (let tile of this.tiles) {
      tile.addEventListener('click', this.tileClick.bind(this));
    }

    if (!this.saved) {
      this.shuffle();
    }

    this.resize();
    this.save();
  }

  /**
   * Adjust the tiles' size and position.
    */
  resize() {
    this.tileWidth = this.board.clientWidth / this.cols;
    this.board.style.height = this.board.clientWidth + 'px';

    for (let tile of this.tiles) {
      tile.style.width = Math.floor(100 / this.cols) - 2 + "%";
      tile.style.height = Math.floor(100 / this.rows) - 2 + "%";
      tile.style.lineHeight = this.tileWidth + 'px'; // Vertical align to be middle
      tile.style.fontSize = this.tileWidth / 2 + 'px';
      this.moveOne(tile, false);
    }
  }

  /**
   * Randomise tiles' index.
   */
  shuffle() {
    // Make an array of rondom numbers between 0-15
    var indices = Array.from(Array(this.total).keys()).sort(() => { return 0.5 - Math.random(); });
    indices.forEach((value, index) => {
      this.tiles[index].setAttribute('data-index', value);
    });

    // For debug: make array of 1 to n without shuffling
    // var indices = Array.from({length: this.total}, (_, i) => i + 1);
    // indices.forEach((value, index) => {
    //   this.tiles[index].setAttribute('data-index', value -1);
    // });
  }

  /**
   * Tile's click event.
   */
  tileClick(event) {
    if (this.finishFlag) {
      return false;
    }

    var tile = event.target;
    if (this.canMove(tile)) {
      let tmp = parseInt(tile.getAttribute('data-index'));
      tile.setAttribute('data-index', this.currentEmpty);
      this.currentEmpty = tmp;
      this.moveOne(tile, true);
    }

    if (this.checkFinish()) {
      this.finishGame();
    }
  }

  /**
   * Check if the current empty space is the next to the tile clicked.
   */
  canMove(tile) {
    let index = parseInt(tile.getAttribute('data-index'));
    if ((index % this.cols == this.currentEmpty % this.cols &&
      Math.abs(index - this.currentEmpty) == this.cols) ||
      (Math.abs(index - this.currentEmpty) == 1 &&
      Math.floor(index / this.cols) == Math.floor(this.currentEmpty / this.cols))) {
      return true;
    }

    return false;
  }

  /**
   * Calculate the tile's position depending on the value of 'data-index' attribute
   */
  moveOne(tile, saving) {
    let index = tile.getAttribute('data-index');
    tile.style.top = this.tileWidth * Math.floor(index / this.cols) + 'px';
    tile.style.left = this.tileWidth * (index % this.cols) + 'px';

    if (saving) {
      this.save();
    }
  }

  /**
   * Check if the puzzle is completed.
   */
  checkFinish() {
    let result = 1;
    for (let tile of this.tiles) {
      result &= tile.getAttribute('data-index') == tile.getAttribute('id');
    }
    return result;
  }

  /**
   * Finish the game.
   */
  finishGame() {
    this.finishFlag = true;
    alert("Congratulations!");
    localStorage.removeItem(dataName);
  }

  /**
   * Save current game status.
   */
  save() {
    let status = {
      board: this.board.innerHTML,
      size: this.rows,
      current: this.currentEmpty
    };
    localStorage.setItem(dataName, JSON.stringify(status));
  }

  /**
   * Start new game.
   */
  reset() {
    localStorage.removeItem(dataName);
    this.saved = null;
    this.board.innerHTML = '';
    this.newGame();
  }
}
