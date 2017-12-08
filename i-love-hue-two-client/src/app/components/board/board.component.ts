import {
  Component, OnInit, OnChanges, ViewChild, ElementRef, Input, Output, EventEmitter
} from '@angular/core';

import * as d3 from 'd3';
import { Tile } from '../../../../../i-love-hue-two-server/models/tile.class';

@Component({
  selector: 'board',
  templateUrl: 'board.component.html',
  styleUrls: [
    'board.component.css'
  ]
})

export class BoardComponent implements OnInit, OnChanges {
  @Input() tiles: Tile[];
  @Input() ownBoard: boolean;
  @Input() gameOver: boolean;
  @Output() boardUpdated = new EventEmitter();
  @ViewChild('board') private boardContainer: ElementRef;

  private margin = {top: 0, bottom: 0, left: 0, right: 0};
  private board:      any;
  private immutables: any;
  private width:      number;
  private height:     number;
  private tileSize:   any;
  private rows:       any;
  private columns:    any;

  private selectedTile1: string;

  constructor() {}

  // initialize board and add gradientMap when data present
  ngOnInit() {
    this.createBoard();
    if (this.tiles) {
      this.updateTiles();
    }
  }

  ngOnChanges(changes: any) {
    if (this.board) {
      this.updateTiles();
    }
  }

  createBoard() {
    let element   = this.boardContainer.nativeElement;
    this.width    = Math.round(element.offsetWidth - this.margin.left - this.margin.right);
    this.height   = Math.round(element.offsetHeight - this.margin.top - this.margin.bottom);

    this.rows     = d3.max(this.tiles, d => d.y);
    this.columns  = d3.max(this.tiles, d => d.x);

    this.tileSize = {
      width: Math.round(this.width / this.columns),
      height: Math.round(this.height / this.rows)
    };

    let svg = d3.select(element).append('svg')
      .attr('height', element.offsetHeight)
      .attr('width', element.offsetWidth);

    // board plot area
    this.board = svg.append('g')
      .attr('class', 'board')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
    this.immutables = svg.append('g')
      .attr('class', 'immutables')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    let defs = svg.append('defs');
  }

  updateTiles() {
    let updateTiles = this.board.selectAll('.board')
      .data(this.tiles);

    let updateImmutables = this.immutables.selectAll('.immutables')
      .data(this.tiles);

    // clean up
    this.board.selectAll('rect').remove();

    // add new tiles
    updateTiles
      .enter()
      .append('rect')
      .attr('class', 'tile')
      .attr('x', d => ((d.x * this.tileSize.width) - this.tileSize.width) + this.tileSize.width / 2)
      .attr('y', d => ((d.y * this.tileSize.height) - this.tileSize.height) + this.tileSize.height / 2)
      .attr('width', 0)
      .attr('height', 0)

      .on('mouseover', this.handleMouseOver)
      .on('mouseout', (d) => {
        return this.handleMouseOut(d, this.selectedTile1, event.target);
      })
      .on('click', (d) => {                                         // don't allow the player to manipulate other boards
        if (!d.immutable && this.ownBoard && !this.gameOver) {      // also don't allow immutable tiles to be swapped
          this.selectedTile1 = this.handleClick(d, this.selectedTile1, event.target);
        }
      })
      .style('fill', (d) => d.color)
      .transition()
      .delay((d) => (d.y + d.x) * 120)
      .duration(500)
      .attr('x', d => (d.x * this.tileSize.width) - this.tileSize.width)
      .attr('y', d => (d.y * this.tileSize.height) - this.tileSize.height)
      .attr('width', this.tileSize.width)
      .attr('height', this.tileSize.height);

    // append little black dot for immutable tiles
    updateImmutables
      .enter()
      .append('circle')
      .attr('cx', (d) => (d.x * this.tileSize.width) - this.tileSize.width / 2)
      .attr('cy', (d) => (d.y * this.tileSize.height) - this.tileSize.width / 2)
      .attr('r', (d) => (d.immutable ? this.tileSize.width / 10 : 0))
      .style('fill-opacity', 0)
      .transition()
      .delay((d) => (d.y + d.x) * 180)
      .duration(500)
      .style('fill', 'black')
      .style('fill-opacity', 1);
  }

  private handleMouseOver(d, i) {
    if (!d.immutable && !this.gameOver) {
      d3.select(this).style('stroke', 'lightgrey');
      d3.select(this).style('stroke-width', '2');
      d3.select(this).style('stroke-alignment', 'inner');
    }
  }

  private handleMouseOut(d, selectedTile, target) {
    if (d.id != selectedTile && !d.immutable && !this.gameOver) {
      d3.select(target).style('stroke', 'none');
    }
  }

  private handleClick(d, selectedTile, target): string {
    let tile = d3.select(target);
    if (!selectedTile) {
      tile.style('stroke', 'darkgrey')
        .style('stroke-width', '2');
      return d.id;
    } else if ((selectedTile && selectedTile === d.id)) {
      d3.selectAll('.tile')
        .style('stroke', 'none');
      return null;
    } else {
      d3.selectAll('.tile')
        .style('stroke', 'none');
      this.boardUpdated.emit({from: selectedTile, to: d.id});
      return null;
    }
  }
}
