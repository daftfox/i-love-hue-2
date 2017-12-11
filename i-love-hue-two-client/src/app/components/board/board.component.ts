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
  private board:        any;
  private immutables:   any;
  private width:        number;
  private height:       number;
  private tileSize:     any;
  private rows:         any;
  private columns:      any;
  private swappedTiles: any;

  private selectedTile: string;

  constructor() {}

  // initialize board and add gradientMap when data present
  ngOnInit() {
    this.createBoard();
    if (this.tiles) {
      this.addTiles();
    }
  }

  ngOnChanges(changes: any) {
    if (changes && changes.tiles) {
      if (this.board && !changes.tiles.previousValue) {
        this.addTiles();                    // started a new game
      } else if (this.board) {
        if (!this.ownBoard){               // for someone else's board
          this.swappedTiles = this.getOpponentsSwappedTiles(changes.tiles.previousValue, changes.tiles.currentValue);
        }
        if (changes.tiles.previousValue &&
            changes.tiles.currentValue) {
          if (changes.tiles.previousValue[0].id !== changes.tiles.currentValue[0].id) {
            this.addTiles();
          } else {
            this.updateTiles()
          }
        }
      }
    }
  }

  private getOpponentsSwappedTiles(from: Tile[], to: Tile[]): any {
    let swappedTiles = {
      from: null,
      to: null
    };
    for (let i = 0; i < from.length - 1; i++) {
      if ((from[i].x !== to[i].x) ||
          (from[i].y !== to[i].y)) {
        if (!swappedTiles.from) {
          swappedTiles.from = from[i].id;
        } else {
          swappedTiles.to = to[i].id;
        }
      }
    }
    return swappedTiles;
  }

  createBoard() {
    let element   = this.boardContainer.nativeElement;
    this.width    = Math.floor(element.offsetWidth - this.margin.left - this.margin.right);
    this.height   = Math.floor(element.offsetHeight - this.margin.top - this.margin.bottom);

    this.rows     = d3.max(this.tiles, d => d.y);
    this.columns  = d3.max(this.tiles, d => d.x);

    this.tileSize = {
      width: Math.floor(this.width / this.columns),
      height: Math.floor(this.height / this.rows)
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
    let data = this.tiles.filter((tile) => (tile.id === this.swappedTiles.from || tile.id === this.swappedTiles.to));
    let reverseData = [
      {x: data[1].x, y: data[1].y},
      {x: data[0].x, y: data[0].y}
    ];

    let tiles = this.board.selectAll('.board')
      .data(data);

    this.board.selectAll(`rect.${this.swappedTiles.from}`).remove();
    this.board.selectAll(`rect.${this.swappedTiles.to}`).remove();

    tiles
      .enter()
      .append('rect')
      .attr('class', (d) => d.id)
      .attr('x', (d, i) => (reverseData[i].x * this.tileSize.width) - this.tileSize.width)
      .attr('y', (d, i) => (reverseData[i].y * this.tileSize.height) - this.tileSize.height)
      .attr('width', this.tileSize.width)
      .attr('height', this.tileSize.height)
      .on('mouseover', (d) => {
        let handler = this.handleMouseOver.bind(this);
        return handler(d);
      })
      .on('mouseout', (d) => {
        let handler = this.handleMouseOut.bind(this);
        return handler(d);
      })
      .on('click', (d) => {
        let handler = this.handleClick.bind(this);
        this.selectedTile = handler(d, event.target);
      })
      .style('fill', (d) => d.color)
      .transition()
      .delay(50)
      .duration(500)
      .attr('x', d => (d.x * this.tileSize.width) - this.tileSize.width)
      .attr('y', d => (d.y * this.tileSize.height) - this.tileSize.height);
  }

  drawTiles(tiles: any) {
    tiles
      .enter()
      .append('rect')
      .attr('class', (d) => d.id)
      .attr('x', d => ((d.x * this.tileSize.width) - this.tileSize.width) + this.tileSize.width / 2)
      .attr('y', d => ((d.y * this.tileSize.height) - this.tileSize.height) + this.tileSize.height / 2)
      .attr('width', 0)
      .attr('height', 0)
      .on('mouseover', (d) => {
        let handler = this.handleMouseOver.bind(this);
        return handler(d, event.target);
      })
      .on('mouseout', (d) => {
        let handler = this.handleMouseOut.bind(this);
        return handler(d, event.target);
      })
      .on('click', (d) => {
        let handler = this.handleClick.bind(this);
        this.selectedTile = handler(d, event.target);
      })
      .style('fill', (d) => d.color)
      .transition()
      .delay((d) => (d.y + d.x) * 120)
      .duration(500)
      .attr('x', d => (d.x * this.tileSize.width) - this.tileSize.width)
      .attr('y', d => (d.y * this.tileSize.height) - this.tileSize.height)
      .attr('width', this.tileSize.width)
      .attr('height', this.tileSize.height);
  }

  drawImmutables(immutables: any) {
    immutables
      .enter()
      .append('circle')
      .attr('cx', (d) => (d.x * this.tileSize.width) - this.tileSize.width / 2)
      .attr('cy', (d) => (d.y * this.tileSize.height) - this.tileSize.height / 2)
      .attr('r', (d) => (d.immutable ? this.tileSize.width / 10 : 0))
      .style('fill-opacity', 0)
      .transition()
      .delay((d) => (d.y + d.x) * 180)
      .duration(500)
      .style('fill', 'black')
      .style('fill-opacity', 1);
  }

  addTiles() {
    let tiles = this.board.selectAll('.board')
      .data(this.tiles);

    let updateImmutables = this.immutables.selectAll('.immutables')
      .data(this.tiles);

    // clean up
    this.board.selectAll('rect').remove();

    // add new tiles
    this.drawTiles(tiles);

    // append little black dot for immutable tiles
    this.drawImmutables(updateImmutables);
  }

  private handleMouseOver(d, target) {
    if (!d.immutable && this.ownBoard && !this.gameOver) {
      d3.select(target).style('stroke', 'lightgrey');
      d3.select(target).style('stroke-width', '2');
      d3.select(target).style('stroke-alignment', 'inner');
    }
  }

  private handleMouseOut(d, target) {
    if (d.id != this.selectedTile && !d.immutable && this.ownBoard && !this.gameOver) {
      d3.select(target).style('stroke', 'none');
    }
  }

  private handleClick(d, target): string {
    if (!d.immutable && this.ownBoard && !this.gameOver) {
      let tile = d3.select(target);
      if (!this.selectedTile) {
        tile.style('stroke', 'darkgrey')
          .style('stroke-width', '2');
        return d.id;
      } else if ((this.selectedTile && this.selectedTile === d.id)) {
        d3.selectAll('rect')
          .style('stroke', 'none');
        return null;
      } else {
        d3.selectAll('rect')
          .style('stroke', 'none');
        this.swappedTiles = {from: this.selectedTile, to: d.id};
        this.boardUpdated.emit(this.swappedTiles);
        return null;
      }
    }
  }
}
