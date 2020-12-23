import { ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
import { Directive } from '@angular/core';
// tslint:disable-next-line: nx-enforce-module-boundaries
import {
  getTokenAtIndex,
  IParsedQuery,
  ParsedQuery,
  Parser,
  Query,
  Stringifier,
  suggestNextTokenType,
} from '@query-ac/parser';

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: '[queryac]',
})
export class AutocompleteDirective {
  private parser: Parser;

  private stringifier: Stringifier;

  private parsed: ParsedQuery;

  @Output() query = new EventEmitter<Query>();

  @Output() position = new EventEmitter<any>();

  @HostListener('input') onInput() {
    try {
      this.parsed = this.parser.parse(this.input.value);
      this.query.emit(this.parsed.toQuery());
      this.onFocus();
    } catch (e) {
      console.error(e);
    }
  }

  @HostListener('focus') onFocus() {
    if (this.parsed) {
      const token = getTokenAtIndex(this.input.selectionStart, this.parsed);
      this.position.emit({
        type: token.type,
        node: {
          ...token.node,
          position: undefined,
        },
        suggestedNextTypes: suggestNextTokenType(token),
      });
    }
  }

  private get input() {
    return this.el.nativeElement as HTMLInputElement;
  }

  constructor(private el: ElementRef) {
    this.parser = new Parser();
    this.stringifier = new Stringifier();
  }
}
