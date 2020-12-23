import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AutocompleteModule } from '@query-ac/autocomplete';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AutocompleteModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
