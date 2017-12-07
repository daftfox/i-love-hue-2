import {
  Component, OnInit, OnChanges, ViewChild, ElementRef, Input, Output, EventEmitter,
  SimpleChange
} from '@angular/core';

import * as d3 from 'd3';
import { Tile } from '../../classes/tile.class';

@Component({
  selector: 'board',
  templateUrl: 'board.component.html',
  styleUrls: [
    'board.component.css'
  ]
})

export class BoardComponent implements OnInit, OnChanges {
  @Input() tiles: Tile[];
  @Output() boardUpdated = new EventEmitter();
  @ViewChild('board') private boardContainer: ElementRef;

  private margin = {top: 0, bottom: 0, left: 0, right: 0};
  private board:    any;
  private width:    number;
  private height:   number;
  private tileSize: any;
  private rows:     any;
  private columns:  any;

  private selectedTile1: string;

  constructor() {}

  // initialize board and add gradientMap when data present
  ngOnInit() {
    this.createBoard();
    if (this.tiles) {
      this.updateBoard();
    }
  }

  ngOnChanges(changes) {
    if (this.board) {
      this.updateBoard();
    }
  }

  createBoard() {
    let element   = this.boardContainer.nativeElement;
    this.width    = element.offsetWidth - this.margin.left - this.margin.right;
    this.height   = element.offsetHeight - this.margin.top - this.margin.bottom;

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

    let defs = svg.append('defs');
  }

  updateBoard() {
    let update = this.board.selectAll('.board')
      .data(this.tiles);

    // remove existing tiles tiles
    update.exit().remove();

    // add new tiles
    update
      .enter()
      .append('rect')
      .attr('class', 'tile')
      .attr('x', d => (d.x * this.tileSize.width) - this.tileSize.width)
      .attr('y', d => (d.y * this.tileSize.height) - this.tileSize.width)
      .attr('width', this.tileSize.width)
      .attr('height', this.tileSize.height)
      .on('mouseover', this.handleMouseOver)
      // example of Lambda programming
      .on('mouseout', (d) => {
        this.handleMouseOut(d, this.selectedTile1, event.target);
      })
      .on('click', (d) => {
        this.selectedTile1 = this.handleClick(d, this.selectedTile1, event.target);
      })
      .style('fill', (d) => d.color);
  }

  private handleMouseOver(d, i) {
    d3.select(this).style('stroke', 'lightgrey');
    d3.select(this).style('stroke-width', '1');
  }

  private handleMouseOut(d, selectedTile, target) {
    if (d.id != selectedTile) {
      d3.select(target).style('stroke', 'none');
    }
  }

  private handleClick(d, selectedTile, target): string {
    let tile = d3.select(target);
    if (!selectedTile) {
      tile.style('stroke', 'darkgrey')
        .style('stroke-width', '1');
      return d.id;
    } else if ((selectedTile && selectedTile === d.id)) {
      d3.selectAll('.tile')
        .style('stroke', 'none');
      return null;
    } else {
      d3.selectAll('.tile')
        .style('stroke', 'none');
      this.boardUpdated.emit({tile1: selectedTile, tile2: d.id});
      return null;
    }
  }
}
