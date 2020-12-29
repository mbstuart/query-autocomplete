import {
  IParsedQuery,
  isLogicalNodeWithPosition,
  ParsedQuery,
  Query,
  QueryNodeWithPosition,
} from '../models';
import { Parser } from './parser';

describe('parser', () => {
  let parser: Parser;

  //#region Queries

  const queries: {
    [key: string]: { input: string; expected: Query };
  } = {
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
    queryQuotedValues: {
      input: '(region IS "THIS AND THAT" OR value < 30) AND sector IS Pharma',
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
                  values: ['THIS AND THAT'],
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
    const parsedQuery = parser.parse(queries['query1'].input).toQuery();

    const expectedOutput: Query = queries['query1'].expected;

    expect(parsedQuery).toEqual(expectedOutput);
  });

  it('should be able to handle quoted strings', () => {
    const parsedQuery = parser
      .parse(queries['queryWithQuotations'].input)
      .toQuery();

    const expectedOutput: Query = queries['queryWithQuotations'].expected;

    expect(parsedQuery).toEqual(expectedOutput);
  });

  it('should be able to handle multiple strings for IN', () => {
    const parsedQuery = parser
      .parse(queries['queryMultipleValues'].input)
      .toQuery();

    const expectedOutput: Query = queries['queryMultipleValues'].expected;

    expect(parsedQuery).toMatchObject(expectedOutput);
  });

  it('should be able to correctly parse positions', () => {
    const input = queries['queryMultipleValues'].input;
    const parsedQuery = parser.parse(input);

    // console.log(JSON.stringify(parsedQuery, null, 2));

    const expectedOutput: IParsedQuery = queries['queryMultipleValues']
      .expected as IParsedQuery;

    expectedOutput.root.position = {
      start: 0,
      end: input.length - 1,
      tokenPositions: {},
    };

    // const getPositions = (q: QueryNodeWithPosition) => {
    //   if (isLogicalNodeWithPosition(q)) {
    //     q.children.forEach(getPositions);
    //   }

    //   console.log(q.position);
    // };

    // getPositions(parsedQuery.root);
    console.log(input);

    console.log(JSON.stringify(parsedQuery.toPrintable(), null, 2));

    expect(parsedQuery).toMatchObject(expectedOutput);
  });

  it('should be able to handle quoted out values', () => {
    const parsedQuery = parser
      .parse(queries['queryQuotedValues'].input)
      .toQuery();

    const expectedOutput: Query = queries['queryQuotedValues'].expected;

    expect(parsedQuery).toMatchObject(expectedOutput);
  });
});
