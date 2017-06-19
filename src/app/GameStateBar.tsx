import React, { Component } from 'react';

type State = {
  gameState: '' | 'X Wins!' | 'O Wins!' | 'Draw';
};

export class GameStateBar extends Component<{}, State> {
  state = { gameState: '' } as State;

  handleGameStateChange(e: CustomEvent) {
    this.setState({ gameState: e.detail });
  }

  handleRestart(e: Event) {
    this.setState({ gameState: '' });
  }

  componentDidMount() {
    window.addEventListener('gameStateChange', (e: CustomEvent) => this.handleGameStateChange(e));
    window.addEventListener('restart', (e: CustomEvent) => this.handleRestart(e));
  }

  componentWillUnmount() {
    window.removeEventListener('gameStateChange', (e: CustomEvent) => this.handleGameStateChange(e));
    window.removeEventListener('restart', (e: CustomEvent) => this.handleRestart(e));
  }

  render() {
    return <div className="gameStateBar"> {this.state.gameState} </div>;
  }
}
