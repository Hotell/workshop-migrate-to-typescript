import React, { Component } from 'react';

import { Board } from './Board';
import { RestartBtn } from './RestartBtn';
import { GameStateBar } from './GameStateBar';

export class App extends Component {
  render() {
    return (
      <div className="app">
        <Board />
        <div className="text-center">
          <span className="description t1"> Player(X) </span>
          <span className="description t2"> Computer(O) </span>
        </div>
        <RestartBtn />
        <GameStateBar />
      </div>
    );
  }
}
