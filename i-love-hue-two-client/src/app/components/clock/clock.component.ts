import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';

@Component({
  selector: 'clock',
  templateUrl: './clock.component.html',
  styleUrls: [
    './clock.component.css'
  ]
})

export class ClockComponent implements OnInit, OnChanges {
  @Input()  countdown: string;
  @Input()  startTime: string;
  @Output() countdownDone = new EventEmitter();

  time: string;
  seconds: number;
  minutes: number;
  countTimer: any;
  countdownTimer: any;
  hurry = false;
  pulse = false;

  constructor() {}

  ngOnInit() {
    this.setThisTime();
    this.updateTime();
  }

  ngOnChanges(changes) {
    this.resetTime();
    if (changes) {
      this.setThisTime();
    }
  }

  private updateTime() {
    this.time = `${ClockComponent.getMinutesOrSecondsAsString(this.minutes)}:${ClockComponent.getMinutesOrSecondsAsString(this.seconds)}`
  }

  private setThisTime(): void {
    this.clearTimers();
    if (this.startTime && !this.countdown) {
      this.parseTime(this.startTime);
      this.countTimer = this.startCount();
    } else if (this.countdown && !this.startTime) {
      this.parseTime(this.countdown);
      this.startCountdown();
    } else {
      this.resetTime();
    }
  }

  private resetTime(): void {
    this.hurry   = false;
    this.pulse   = false;
    this.minutes = 0;
    this.seconds = 0;

    this.updateTime();
  }

  private clearTimers(): void {
    clearInterval(this.countdownTimer);
    clearInterval(this.countTimer);
  }

  private startCount(): any {
    return setInterval(() => {
      this.seconds++;
      if (this.seconds === 60) {
        this.seconds = 0;
        this.minutes++;
      }
      this.updateTime();
    }, 1000);
  }

  private startCountdown(): void {
    let counter = (this.minutes * this.seconds) + this.seconds;
    this.countdownTimer = setInterval(() => {
      this.seconds--;
      if (this.seconds === -1) {
        this.seconds = 59;
        this.minutes--;
      }
      if (this.seconds === 5 && this.minutes === 0) {
        this.hurry = true;
        this.pulse = true;
      }
      if (this.seconds === 0 && this.minutes === 0) {
        this.pulse = false;
      }
      this.updateTime();
      counter--;
      if (counter === 0) {
        clearInterval(this.countdownTimer);
        this.countdownDone.emit();
      }
    }, 1000);
  }

  private parseTime(time) {
    this.minutes = parseInt(time.split(':')[0]);
    this.seconds = parseInt(time.split(':')[1]);
  }

  private static getMinutesOrSecondsAsString(t): string {
    return `${(t > 9 ? t : '0' + t)}`;
  }
}
