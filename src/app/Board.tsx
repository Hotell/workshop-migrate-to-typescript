import React, { Component } from 'react';

import { playerCell, aiCell } from './constants';
import { CellValue, GameState } from './types';
import { Cell } from './Cell';

type State = {
  cells: CellValue[];
  gameState: GameState;
};

export class Board extends Component<{}, State> {
  state = this.getInitState();

  /**
   * @private
   * @returns {State}
   */
  getInitState(): State {
    let cells = Array.apply(null, Array(9)).map(() => '');
    return { cells: cells, gameState: '' };
  }

  /**
   * @private
   */
  resetState() {
    this.setState(this.getInitState());
  }

  componentDidMount() {
    window.addEventListener('restart', () => this.resetState());
  }

  componentWillUnmount() {
    window.removeEventListener('restart', () => this.resetState());
  }

  /**
   * Fire a global event notifying GameState changes
   * @private
   */
  handleGameStateChange(newGameState: GameState) {
    var event = new CustomEvent('gameStateChange', { detail: newGameState });
    event.initEvent('gameStateChange', false, true);
    window.dispatchEvent(event);
  }

  /**
   * check the game state - use the latest move
   * @private
   */
  checkGameState(cells: CellValue[], latestPos: number, latestVal: string): GameState {
    if (this.state.gameState !== '') {
      return this.state.gameState;
    }

    // check row
    let result = this.check3Cells(
      cells,
      3 * Math.floor(latestPos / 3),
      3 * Math.floor(latestPos / 3) + 1,
      3 * Math.floor(latestPos / 3) + 2
    );
    if (result) {
      return result;
    }

    // check col
    result = this.check3Cells(cells, latestPos % 3, latestPos % 3 + 3, latestPos % 3 + 6);
    if (result) {
      return result;
    }

    // check diag
    result = this.check3Cells(cells, 0, 4, 8);
    if (result) {
      return result;
    }
    result = this.check3Cells(cells, 2, 4, 6);
    if (result) {
      return result;
    }

    // check draw - if all cells are filled
    if (this.findAllEmptyCells(cells).length === 0) {
      return 'Draw';
    }

    return '';
  }

  /**
   * check if 3 cells have same non-empty val - return the winner state; otherwise undefined
   * @private
   */
  check3Cells(cells: CellValue[], pos0: number, pos1: number, pos2: number): GameState | undefined {
    if (cells[pos0] === cells[pos1] && cells[pos1] === cells[pos2] && cells[pos0] !== '') {
      if (cells[pos0] === 'X') {
        return 'X Wins!';
      }
      return 'O Wins!';
    } else {
      return undefined;
    }
  }

  /**
   * list all empty cell positions
   * @private
   */
  findAllEmptyCells(cells: CellValue[]): number[] {
    return cells
      .map((v, i) => {
        if (v === '') {
          return i;
        } else {
          return -1;
        }
      })
      .filter(v => {
        return v !== -1;
      });
  }

  /**
   * make a move
   * @private
   */
  move(pos: number, val: CellValue, callback?: () => void): void {
    if (this.state.gameState === '' && this.state.cells[pos] === '') {
      let newCells = this.state.cells.slice();
      newCells[pos] = val;
      let oldState = this.state.gameState;
      this.setState({ cells: newCells, gameState: this.checkGameState(newCells, pos, val) }, () => {
        if (this.state.gameState !== oldState) {
          this.handleGameStateChange(this.state.gameState);
        }
        if (callback) {
          callback.call(this);
        }
      });
    }
  }

  /**
   * handle a new move from player
   * @private
   * @param {number} pos
   */
  handleNewPlayerMove(pos) {
    this.move(pos, playerCell, () => {
      // AI make a random move following player's move
      let emptyCells = this.findAllEmptyCells(this.state.cells);
      let pos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      this.move(pos, aiCell);
    });
  }

  render() {
    var cells = this.state.cells.map((v, i) => {
      return <Cell key={i} pos={i} val={v} handleMove={() => this.handleNewPlayerMove(i)} />;
    });

    return (
      <div className="board">
        {cells}
      </div>
    );
  }
}
