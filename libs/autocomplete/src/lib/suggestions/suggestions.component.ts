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

  @HostListener('keypress', ['$event']) onKeyPress(keyEvent: KeyboardEvent) {
    switch (keyEvent.key) {
      case 'Enter':
        this.suggestionSelected.emit(this.getSelected());
        break;
      default:
        break;
    }
  }

  constructor(
    private el: ElementRef,
    @Inject(DOCUMENT) private document: Document
  ) {}

  public tab() {
    const htmlRoot: HTMLElement = this.el.nativeElement;

    const option: HTMLDivElement = htmlRoot.querySelector('.suggestion');

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
