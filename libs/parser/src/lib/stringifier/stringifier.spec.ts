import { ParsedQuery } from '../models';
import { Stringifier } from './stringifier';
describe('Stringifier', () => {
  let stringifier: Stringifier;

  //#region Queries

  const queries: { [key: string]: { input: string; expected: ParsedQuery } } = {
    query1: {
      input: '(region IN [Europe] OR value < 30) AND sector IN [Pharma]',
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
    stringifier = new Stringifier();
  });

  it('should create', () => {
    expect(stringifier).toBeInstanceOf(Stringifier);
  });

  it('should have stringify Method', () => {
    expect(stringifier.stringify).toBeTruthy();
  });

  it('should return parsed object from string', () => {
    const parsedQuery = stringifier.stringify(queries['query1'].expected);

    // console.log(JSON.stringify(parsedQuery, null, 2));

    const expectedOutput: string = queries['query1'].input;

    expect(parsedQuery).toEqual(expectedOutput);
  });
});
