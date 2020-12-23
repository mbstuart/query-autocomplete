import { ParsedQuery } from './parsed-query';

describe('ParsedQuery', () => {
  let parsedQuery: ParsedQuery;

  beforeEach(() => {
    parsedQuery = new ParsedQuery();
  });

  it('should convert to flat query', () => {
    parsedQuery.root = {
      children: [
        {
          property: 'doob',
          values: ['dab'],
          operator: 'IN',
          position: {
            foo: 'bar',
          } as any,
        },
        {
          property: 'doob',
          values: ['dab'],
          operator: 'IN',
          position: {
            foo: 'bar',
          } as any,
        },
      ],
      logicalConnector: 'AND',
      position: {
        foo: 'bar',
      } as any,
    };

    const query = parsedQuery.toQuery();

    expect(query).toEqual({
      root: {
        children: [
          {
            property: 'doob',
            values: ['dab'],
            operator: 'IN',
          },
          {
            property: 'doob',
            values: ['dab'],
            operator: 'IN',
          },
        ],
        logicalConnector: 'AND',
      },
    });
  });
});
