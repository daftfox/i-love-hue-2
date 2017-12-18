import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'welcome-screen',
  templateUrl: './welcome-screen.component.html',
  styleUrls: [
    './welcome-screen.component.css'
  ]
})


export class WelcomeScreenComponent {
  @Output() connect = new EventEmitter();

  url:  string;
  name: string;

  connectToServer(name: string, url: string): void {
    this.connect.emit({name: name, url: url});
  }
  
}
