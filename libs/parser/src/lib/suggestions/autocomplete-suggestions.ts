import { Observable, of } from 'rxjs';
import {
  isLogicalNodeWithPosition,
  LogicalConnectors,
  Property,
  Suggestion,
  SuggestionOptions,
} from '../models';
import { QueryToken } from '../models/parsed-query/query-token';
import { TokenType } from '../models/parsed-query/token-type';
import { getTokenAtIndex, getTokenStartAtIndex } from '../utils';

export class AutocompleteSuggestions {
  private readonly propertiesArr: (Property & {
    searchId: string;
    searchName: string;
  })[];

  constructor(private readonly properties: { [propertyId: string]: Property }) {
    this.propertiesArr = Object.values(this.properties).map((prop) => {
      return {
        ...prop,
        searchId: prop.id.toUpperCase(),
        searchName: prop.id.toUpperCase(),
      };
    });
  }

  public suggest(position: number, token: QueryToken) {
    let tokenType = token.type;

    // if (position >= token.node.position.end) {
    //   tokenType = suggestNextTokenType(token)[0];
    // }

    let property = null;

    if (!isLogicalNodeWithPosition(token.node)) {
      if (token.node.property) {
        property = this.properties[token.node.property];
      }
    }

    const getOptions = this.getOptionsForTokenType(tokenType, property, {
      maxOptions: 10,
    });

    return getOptions;
  }

  public acceptSuggestion(
    position: number,
    token: QueryToken,
    suggestion: Suggestion,
    sentence: string
  ) {
    const start = +getTokenStartAtIndex(position, token.node);

    return `${sentence.substring(0, start)}${suggestion.id} `;
  }

  private getOptionsForTokenType(
    type: TokenType,
    property: Property,
    params?: Partial<SuggestionOptions>
  ): Observable<Suggestion[]> {
    switch (type) {
      case 'LogicalOperator':
        return of(
          Object.keys(LogicalConnectors).map((id) => ({ id, name: id }))
        );

      case 'AtomicValue':
        return property.options;

      case 'AtomicProperty':
        const properties = this.propertiesArr.filter(
          (prop) =>
            !params ||
            !params.searchText ||
            prop.searchName.includes(params.searchText) ||
            prop.searchId.includes(params.searchText)
        );
        //   .slice((params && params.maxOptions) || 10);

        return of(properties);
      default:
        return of([]);
    }
  }
}
