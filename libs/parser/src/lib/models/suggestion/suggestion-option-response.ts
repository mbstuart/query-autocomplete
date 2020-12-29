import { ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { Suggestion } from './suggestion';

export interface SuggestionOptionResponse {
  options?: Suggestion[];

  optionType: 'list' | 'numeric';

  selectionElement?: ComponentRef<any>;
}
