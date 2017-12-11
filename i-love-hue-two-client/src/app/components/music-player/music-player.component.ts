import { Component } from '@angular/core';
import { Helper } from '../../../../../i-love-hue-two-server/models/helper.class';

@Component({
  selector: 'music-player',
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.css']
})

export class MusicPlayerComponent {
  soundTrack:   any;
  currentTrack: number;
  play:         boolean = false;
  soundTracks = [
    'Blue_Dot_Sessions_-_01_-_Yarrow_and_Root.mp3',
    'Blue_Dot_Sessions_-_02_-_The_Wooden_Platform.mp3',
    'Blue_Dot_Sessions_-_05_-_Long_and_Low_Cloud.mp3',
    'Blue_Dot_Sessions_-_06_-_4_Point_Path.mp3',
    'Blue_Dot_Sessions_-_08_-_Easement.mp3',
    'Blue_Dot_Sessions_-_10_-_Well_Water.mp3'
  ];

  constructor() {
    this.soundTrack = new Audio();
    this.currentTrack = Helper.rng(0, this.soundTracks.length - 1);
    this.soundTrack.src = `./assets/sound-tracks/${this.soundTracks[this.currentTrack]}`;
    this.soundTrack.load();
    //this.soundTrack.play();
    //this.play = true;

    this.soundTrack.addEventListener('ended', this.nextSong.bind(this));
  }

  pauseMusic(): void {
    if (this.play) {
      this.soundTrack.pause();
    } else {
      this.soundTrack.play();
    }
    this.play = !this.play;
  }

  nextSong(): void {
    this.currentTrack++;
    if (this.currentTrack >= this.soundTracks.length - 1) this.currentTrack = 0;
    this.soundTrack.src = `./assets/sound-tracks/${this.soundTracks[this.currentTrack]}`;
    this.soundTrack.pause();
    this.soundTrack.load();
    this.soundTrack.play();
  }
}
