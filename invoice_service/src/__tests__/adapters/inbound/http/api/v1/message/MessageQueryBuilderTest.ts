import QueryBuilder from '@adapters/inbound/http/api/v1/message/MessageQueryBuilder';

describe('QueryBuilder', () => {
    let queryBuilder: QueryBuilder;

    beforeEach(() => {
        queryBuilder = new QueryBuilder();
    });

    it('should set sort order by timestamp to descending', () => {
        queryBuilder.withOrderByTimestamp();
        expect(queryBuilder.getSort()).toEqual({ timestamp: 'desc' });
    });

    it('should set filter by receiver', () => {
        const receiver = 'receiver1';
        queryBuilder.withFilterByReceiver(receiver);
        expect(queryBuilder.getQuery()).toEqual({ receiver });
    });

    it('should set date range filter', () => {
        const from = new Date('2021-01-01');
        const to = new Date('2021-12-31');
        queryBuilder.withDateRangeFilter(from, to);
        expect(queryBuilder.getQuery()).toEqual({ timestamp: { $gte: from, $lte: to } });
    });

    it('should set query on receiver or content', () => {
        const query = 'test';
        queryBuilder.withQueryOnReceiverOrContent(query);
        expect(queryBuilder.getQuery()).toEqual({
            $or: [
                { receiver: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } }
            ]
        });
    });

    it('should set paid filter', () => {
        queryBuilder.withPaidFilter();
        expect(queryBuilder.getQuery()).toEqual({ paid: true });
    });

    it('should set BRL currency filter', () => {
        queryBuilder.withBRLCurrencyFilter();
        expect(queryBuilder.getQuery()).toEqual({ currency: 'BRL' });
    });

    it('should set BTC currency filter', () => {
        queryBuilder.withBTCCurrencyFilter();
        expect(queryBuilder.getQuery()).toEqual({ currency: 'BTC' });
    });

    it('should remove currency filter', () => {
        queryBuilder.withBTCCurrencyFilter();
        queryBuilder.withoutCurrencyFilter();
        expect(queryBuilder.getQuery()).toEqual({});
    });

    it('should return the correct query object', () => {
        const receiver = 'receiver1';
        const from = new Date('2021-01-01');
        const to = new Date('2021-12-31');
        const query = 'test';

        queryBuilder
            .withFilterByReceiver(receiver)
            .withDateRangeFilter(from, to)
            .withQueryOnReceiverOrContent(query)
            .withPaidFilter()
            .withBRLCurrencyFilter();

        expect(queryBuilder.getQuery()).toEqual({
            receiver,
            currency: 'BRL',
            timestamp: { $gte: from, $lte: to },
            $or: [
                { receiver: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } }
            ],
            paid: true
        });
    });

    it('should return the correct sort object', () => {
        queryBuilder.withOrderByTimestamp();
        expect(queryBuilder.getSort()).toEqual({ timestamp: 'desc' });
    });

    it('should reset the query and sort objects', () => {
        queryBuilder
            .withFilterByReceiver('receiver1')
            .withOrderByTimestamp();

        queryBuilder.reset();

        expect(queryBuilder.getQuery()).toEqual({});
        expect(queryBuilder.getSort()).toEqual({});
    });
});