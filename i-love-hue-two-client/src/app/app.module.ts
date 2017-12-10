import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { BoardComponent } from './components/board/board.component';

import { AppComponent } from './app.component';
import { PlayFieldComponent } from './components/play-field/play-field.component';
import { MusicPlayerComponent } from './components/music-player/music-player.component';
import { TitleHeaderComponent } from './components/header/title-header.component';
import { ClockComponent } from './components/clock/clock.component';
import { ServerLobbyComponent } from './components/server-lobby/server-lobby.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    PlayFieldComponent,
    MusicPlayerComponent,
    TitleHeaderComponent,
    ClockComponent,
    ServerLobbyComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
