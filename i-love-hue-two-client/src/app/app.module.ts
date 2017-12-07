import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { BoardComponent } from './components/board/board.component';

import { AppComponent } from './app.component';
import { PlayFieldComponent } from './components/play-field/play-field.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    PlayFieldComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
