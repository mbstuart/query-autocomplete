import {
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Output,
  ViewContainerRef,
} from '@angular/core';
import { Directive } from '@angular/core';
import { ChildActivationStart } from '@angular/router';
// tslint:disable-next-line: nx-enforce-module-boundaries
import {
  AutocompleteSuggestions,
  getTokenAtIndex,
  IParsedQuery,
  ListProperty,
  ParsedQuery,
  Parser,
  Query,
  QueryNode,
  Stringifier,
  Suggestion,
  suggestNextTokenType,
} from '@query-ac/parser';
import { QueryToken } from 'libs/parser/src/lib/models/parsed-query/query-token';
import { forkJoin, Observable, of, ReplaySubject } from 'rxjs';
import { SuggestionsComponent } from '../suggestions';
import {
  catchError,
  distinctUntilChanged,
  finalize,
  first,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { TokenType } from 'libs/parser/src/lib/models/parsed-query/token-type';
@Directive({
  // tslint:disable-next-line: directive-selector
  selector: '[queryac]',
})
export class AutocompleteDirective {
  token: Observable<{
    index: number;
    type: TokenType;
    node: QueryNode;
    token: QueryToken;
    suggestedNextTypes: TokenType[];
  }>;
  private get input() {
    return this.el.nativeElement as HTMLInputElement;
  }

  private position$ = new ReplaySubject<number>(1);

  constructor(
    private el: ElementRef,
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    public viewContainerRef: ViewContainerRef
  ) {
    this.parser = new Parser();
    this.stringifier = new Stringifier();

    this.suggestions = new AutocompleteSuggestions({
      country: new ListProperty('country', 'Country', [
        {
          id: 'austria',
          name: 'Austria',
        },
        {
          id: 'belgium',
          name: 'Belgium',
        },
      ]),
      sector: new ListProperty('sector', 'Sector', [
        {
          id: 'pharma',
          name: 'Pharma',
        },
        {
          id: 'industrials',
          name: 'Industrials',
        },
      ]),
    });

    this.token = this.position$.pipe(
      distinctUntilChanged(),
      map((position) => {
        const token = getTokenAtIndex(position, this.parsed.root);
        const suggestedNextTypes = suggestNextTokenType(token);
        console.info(
          `current type: ${
            token.type
          } \n suggested next types: ${suggestedNextTypes.join(',')}`
        );
        return {
          index: position,
          type: token.type,
          node: {
            ...token.node,
            position: undefined,
          },
          token,
          suggestedNextTypes,
        };
      })
    );

    this.token
      .pipe(
        tap(({ index, type, token, suggestedNextTypes }) => {
          this.position.emit({
            index,
            type,
            node: {
              ...token.node,
              position: undefined,
            },
            suggestedNextTypes,
          });
        }),
        switchMap((obj: { index: number; token: QueryToken }) => {
          return this.getSuggestions(obj.index, obj.token);
        }),
        catchError((err) => {
          console.error(err);
          return of();
        })
      )
      .subscribe();
  }
  private parser: Parser;

  private stringifier: Stringifier;

  private parsed: ParsedQuery;

  @Output() query = new EventEmitter<Query>();

  @Output() position = new EventEmitter<any>();

  private comp: ComponentRef<SuggestionsComponent>;

  private suggestions: AutocompleteSuggestions;

  @HostBinding('tabIndex') tabIndex = 0;

  @HostListener('input') onInput() {
    try {
      this.parsed = this.parser.parse(this.input.value);
      this.query.emit(this.parsed.toQuery());
      this.position$.next(this.input.selectionStart);
      this.onFocus();
    } catch (e) {
      console.error(e);
    }
  }

  @HostListener('focus') onFocus() {
    if (this.parsed) {
      this.position$.next(this.input.selectionStart);
    }
  }

  @HostListener('blue') onBlue() {
    this.hideSuggestions();
  }

  @HostListener('keydown', ['$event']) keydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Tab':
        this.handleTab();
        event.preventDefault();
        break;

      default:
        break;
    }
  }

  private showSuggestions(suggestions: Suggestion[]) {
    if (!this.comp) {
      const factory = this.componentFactoryResolver.resolveComponentFactory(
        SuggestionsComponent
      );
      this.comp = this.viewContainerRef.createComponent(factory);

      this.comp.instance.suggestionSelected
        .pipe(
          switchMap((suggestion) => {
            return forkJoin({
              suggestion: of(suggestion),
              lastPosition: this.token.pipe(first()),
            });
          }),
          tap(({ suggestion, lastPosition }) => {
            const { index, token } = lastPosition;
            const newSentence = this.suggestions.acceptSuggestion(
              index,
              token,
              suggestion,
              this.input.value
            );
            this.input.value = newSentence;
            this.hideSuggestions();
          }),
          first(),
          finalize(() => {
            this.input.focus();
            this.onInput();
          }),
          catchError((err) => {
            console.error(err);
            return of({});
          })
        )
        .subscribe();
    }

    this.comp.instance.suggestions = suggestions;
  }

  private hideSuggestions() {
    this.viewContainerRef.remove();

    this.comp = null;
  }

  private getSuggestions(
    index: number,
    token: QueryToken
  ): Observable<Suggestion[]> {
    return this.suggestions.suggest(index, token).pipe(
      tap((suggestions) => {
        this.showSuggestions(suggestions);
      }),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  private handleTab() {
    if (this.comp && this.comp.instance) {
      this.comp.instance.tab();
    }
  }
}
