import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'title-header',
  templateUrl: './title-header.component.html',
  styleUrls: [
    './title-header.component.css'
  ]
})

export class TitleHeaderComponent implements OnInit {
  @Input() subtitle: string;

  subtitleCharacters: Array<string>;

  constructor() {}

  ngOnInit() {
    this.subtitleCharacters = Array.from(this.subtitle)
  }
}
