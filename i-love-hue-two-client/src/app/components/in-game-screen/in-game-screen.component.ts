import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Client }                                 from '../../../../../i-love-hue-two-server/models/client.class';

@Component({
  selector: 'in-game-screen',
  templateUrl: './in-game-screen.component.html',
  styleUrls: [
    './in-game-screen.component.css'
  ]
})

export class InGameScreenComponent {
  @Input() celebrations: string;
  @Input() self:         Client;
  @Input() countdown:    string;

  @Output() swap          = new EventEmitter();
  @Output() countdownDone = new EventEmitter();

  // Validation function returning true when the current round has finished
  gameOver(): boolean {
    if (this.celebrations) return true;
    else return false;
  }

  tileSwap(swap: any): void {
    this.swap.emit({tileSwap: swap});
  }

  countdownFinished(): void {
    this.countdownDone.emit();
  }
}
