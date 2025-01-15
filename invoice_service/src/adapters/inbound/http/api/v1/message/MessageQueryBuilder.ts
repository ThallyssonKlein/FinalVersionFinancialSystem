export default class QueryBuilder {
    private query: any = {};
    private sort: any = {};

    withOrderByTimestamp(): QueryBuilder {
        this.sort.timestamp = 'desc';
        return this;
    }

    withFilterByReceiver(receiver: string): QueryBuilder {
        this.query.receiver = receiver;
        return this;
    }

    withDateRangeFilter(from: Date, to: Date): QueryBuilder {
        this.query.timestamp = {
            $gte: from,
            $lte: to
        };
        return this;
    }

    withExactDateFilter(date: Date): QueryBuilder {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
    
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);
    
        this.query.timestamp = {
            $gte: startOfDay,
            $lte: endOfDay
        };
        return this;
    }

    withQueryOnReceiverOrContent(query: string): QueryBuilder {
        this.query.$or = [
            { receiver: { $regex: query, $options: 'i' } },
            { content: { $regex: query, $options: 'i' } }
        ];
        return this;
    }

    withPaidFilter(): QueryBuilder {
        this.query.paid = true;
        return this;
    }

    withBRLCurrencyFilter(): QueryBuilder {
        this.query.currency = 'BRL';
        return this;
    }

    withBTCCurrencyFilter(): QueryBuilder {
        this.query.currency = 'BTC';
        return this;
    }

    withoutCurrencyFilter(): QueryBuilder {
        delete this.query.currency;
        return this;
    }

    withPaymentIdFilter(paymentId: string): QueryBuilder {
        this.query.paymentId = paymentId;
        return this;
    }

    getQuery(): any {
        return this.query;
    }

    getSort(): any {
        return this.sort;
    }

    reset(): void {
        this.query = {};
        this.sort = {};
    }
}