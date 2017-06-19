import React, { Component, MouseEvent } from 'react';

export class Cell extends Component {
  /**
   * position of cell to className
   * @param {number} pos
   */
  posToClassName(pos) {
    let className = 'cell';
    switch (Math.floor(pos / 3)) {
      case 0:
        className += ' top';
        break;
      case 2:
        className += ' bottom';
        break;
      default:
        break;
    }
    switch (pos % 3) {
      case 0:
        className += ' left';
        break;
      case 2:
        className += ' right';
        break;
      default:
        break;
    }
    return className;
  }

  /**
   *
   * @param {MouseEvent=} e
   */
  handleClick(e) {
    this.props.handleMove();
  }

  render() {
    let name = this.props.val;
    if (this.props.val === '') {
      name = '';
    }
    return (
      <div className={this.posToClassName(this.props.pos)} onClick={e => this.handleClick(e)}>
        <div className={name}> {this.props.val} </div>
      </div>
    );
  }
}
