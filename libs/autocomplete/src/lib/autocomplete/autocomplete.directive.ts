import { ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
import { Directive } from '@angular/core';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { ParsedQuery, Parser, Stringifier } from '@query-ac/parser';

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: '[queryac]',
})
export class AutocompleteDirective {
  private parser: Parser;

  private stringifier: Stringifier;

  @Output() query = new EventEmitter<ParsedQuery>();

  @HostListener('keydown') onKeyDown() {
    try {
      const parsed = this.parser.parse(this.input.value);
      this.query.emit(parsed);
    } catch (e) {}
  }

  @HostListener('mouseleave') onMouseLeave() {}

  private get input() {
    return this.el.nativeElement as HTMLInputElement;
  }

  constructor(private el: ElementRef) {
    this.parser = new Parser();
    this.stringifier = new Stringifier();
  }
}
