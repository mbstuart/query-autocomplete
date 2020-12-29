import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SuggestionsComponent } from './suggestions.component';

@NgModule({
  imports: [CommonModule],
  declarations: [SuggestionsComponent],
  exports: [SuggestionsComponent],
  entryComponents: [SuggestionsComponent],
})
export class SuggestionsModule {}
