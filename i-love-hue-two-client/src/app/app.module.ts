// Core dependencies
import { BrowserModule }              from '@angular/platform-browser';
import { BrowserAnimationsModule }    from '@angular/platform-browser/animations';
import { NgModule }                   from '@angular/core';
import { FormsModule }                from '@angular/forms';
import { HttpModule }                 from '@angular/http';

import { AppComponent }               from './app.component';

// Reusable components
import { PlayFieldComponent }         from './components/play-field/play-field.component';
import { BoardComponent }             from './components/board/board.component';
import { MusicPlayerComponent }       from './components/music-player/music-player.component';
import { TitleHeaderComponent }       from './components/header/title-header.component';
import { ClockComponent }             from './components/clock/clock.component';
import { ChatLobbyComponent }         from './components/chat-lobby/chat-lobby.component';

// Screen components
import { WelcomeScreenComponent }     from './components/welcome-screen/welcome-screen.component';
import { ServerLobbyScreenComponent } from './components/server-lobby-screen/server-lobby-screen.component';
import { GameLobbyScreenComponent }   from './components/game-lobby-screen/game-lobby-screen.component';
import { InGameScreenComponent }      from './components/in-game-screen/in-game-screen.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    PlayFieldComponent,
    MusicPlayerComponent,
    TitleHeaderComponent,
    ClockComponent,
    ChatLobbyComponent,
    WelcomeScreenComponent,
    ServerLobbyScreenComponent,
    GameLobbyScreenComponent,
    InGameScreenComponent
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
