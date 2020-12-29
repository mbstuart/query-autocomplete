import { DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  Output,
} from '@angular/core';
import { Suggestion } from '@query-ac/parser';

@Component({
  selector: 'ac-suggestions',
  templateUrl: './suggestions.component.html',
  styleUrls: ['./suggestions.component.scss'],
})
export class SuggestionsComponent {
  @Input() suggestions: Suggestion[];

  @Input() searchTerm: string[];

  @Output() suggestionSelected = new EventEmitter<Suggestion>();

  @HostListener('keydown', ['$event']) onKeyPress(keyEvent: KeyboardEvent) {
    console.log(keyEvent.key);
    switch (keyEvent.key) {
      case 'Enter':
        this.suggestionSelected.emit(this.getSelected());
        break;
      case 'ArrowUp':
        this.tab('previous');
        break;
      case 'ArrowDown':
        this.tab('next');
        break;
      default:
        break;
    }
  }

  constructor(
    private el: ElementRef,
    @Inject(DOCUMENT) private document: Document
  ) {}

  public tab(opt: 'first' | 'next' | 'previous' = 'first') {
    const htmlRoot: HTMLElement = this.el.nativeElement;

    const options: NodeListOf<HTMLElement> = htmlRoot.querySelectorAll(
      '.suggestion'
    );

    let option: HTMLElement;

    const current = Array.from(options).findIndex(
      (el) => el === this.document.activeElement
    );

    switch (opt) {
      case 'first':
        option = options[0];
        break;
      case 'next':
        option = options[current + 1];
        break;
      case 'previous':
        option = options[current - 1];
        break;
    }

    option.focus();
  }

  public select(suggestion: Suggestion) {
    this.suggestionSelected.emit(suggestion);
  }

  private getSelected() {
    const activeElement = this.document.activeElement;

    const suggestionId =
      activeElement && activeElement.attributes.getNamedItem('suggestionid');

    if (suggestionId) {
      return this.suggestions.find((sugg) => sugg.id === suggestionId.value);
    } else {
      return null;
    }
  }
}
