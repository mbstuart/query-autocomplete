import { Component } from '@angular/core';
import { ParsedQuery } from '@query-ac/parser';

@Component({
  selector: 'query-autocomplete-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  query: string;

  public queryUpdated(query: ParsedQuery) {
    this.query = JSON.stringify(query, null, 2);
  }
}
