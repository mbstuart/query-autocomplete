import { ParsedQuery } from '../models';
import { Parser } from './parser';

describe('parser', () => {
  let parser: Parser;

  //#region Queries

  const queries: { [key: string]: { input: string; expected: ParsedQuery } } = {
    query1: {
      input: '(region IS Europe OR value < 30) AND sector IS Pharma',
      expected: {
        root: {
          logicalConnector: 'AND',
          children: [
            {
              logicalConnector: 'OR',
              children: [
                {
                  property: 'region',
                  operator: 'IN',
                  values: ['Europe'],
                },
                {
                  property: 'value',
                  operator: 'LT',
                  values: [30],
                },
              ],
            },
            {
              property: 'sector',
              operator: 'IN',
              values: ['Pharma'],
            },
          ],
        },
      },
    },
    queryWithQuotations: {
      input: '(region IS "Asia Minor" OR value < 30) AND sector IS Pharma',
      expected: {
        root: {
          logicalConnector: 'AND',
          children: [
            {
              logicalConnector: 'OR',
              children: [
                {
                  property: 'region',
                  operator: 'IN',
                  values: ['Asia Minor'],
                },
                {
                  property: 'value',
                  operator: 'LT',
                  values: [30],
                },
              ],
            },
            {
              property: 'sector',
              operator: 'IN',
              values: ['Pharma'],
            },
          ],
        },
      },
    },
    queryMultipleValues: {
      input:
        '(region IN ["Asia Minor", "Europe"] OR value < 30) AND sector IS Pharma',
      expected: {
        root: {
          logicalConnector: 'AND',
          children: [
            {
              logicalConnector: 'OR',
              children: [
                {
                  property: 'region',
                  operator: 'IN',
                  values: ['Asia Minor', 'Europe'],
                },
                {
                  property: 'value',
                  operator: 'LT',
                  values: [30],
                },
              ],
            },
            {
              property: 'sector',
              operator: 'IN',
              values: ['Pharma'],
            },
          ],
        },
      },
    },
  };

  //#endregion

  beforeEach(() => {
    parser = new Parser();
  });

  it('should create', () => {
    expect(parser).toBeInstanceOf(Parser);
  });

  it('should have parse Method', () => {
    expect(parser.parse).toBeTruthy();
  });

  it('should return parsed object from string', () => {
    const parsedQuery = parser.parse(queries['query1'].input);

    // console.log(JSON.stringify(parsedQuery, null, 2));

    const expectedOutput: ParsedQuery = queries['query1'].expected;

    expect(parsedQuery).toEqual(expectedOutput);
  });

  it('should be able to handle quoted strings', () => {
    const parsedQuery = parser.parse(queries['queryWithQuotations'].input);

    // console.log(JSON.stringify(parsedQuery, null, 2));

    const expectedOutput: ParsedQuery = queries['queryWithQuotations'].expected;

    expect(parsedQuery).toEqual(expectedOutput);
  });

  it('should be able to handle multiple strings for IN', () => {
    const parsedQuery = parser.parse(queries['queryMultipleValues'].input);

    // console.log(JSON.stringify(parsedQuery, null, 2));

    const expectedOutput: ParsedQuery = queries['queryMultipleValues'].expected;

    expect(parsedQuery).toEqual(expectedOutput);
  });
});
