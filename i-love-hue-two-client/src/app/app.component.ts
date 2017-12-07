import { Component, OnInit } from '@angular/core';
import { ParticleJs } from './config/particlejs.config';
import { GradientMap } from './classes/gradient-map.class';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  state: string;
  gradientMap: GradientMap;

  constructor(){
    this.state = 'play';
    this.gradientMap = new GradientMap('#474A9B', '#1E966C', '#C74FAA', '#F5DFB8', 10, 10);
  }

  switchState(newState): void {
    this.state = newState;
  }

  playerAction(action) {
    this.gradientMap.swapTiles(action);
  }

  ngOnInit () {
    particlesJS.load('particles-js', ParticleJs.config);
  }
}
