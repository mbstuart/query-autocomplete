import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutocompleteDirective } from './autocomplete.directive';
import { SuggestionsModule } from '../suggestions';

@NgModule({
  imports: [CommonModule, SuggestionsModule],
  declarations: [AutocompleteDirective],
  exports: [AutocompleteDirective],
})
export class AutocompleteModule {}
