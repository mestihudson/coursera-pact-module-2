const path = require('path');
const { PactV4, MatchersV3 } = require('@pact-foundation/pact');
const { TransactionClient } = require('../src/transactionClient');

const { eachLike, integer, decimal, string, iso8601DateTime } = MatchersV3;

const pactDir = path.resolve(__dirname, '..', 'pacts');

const provider = new PactV4({
  consumer: 'TransactionConsumer',
  provider: 'PaymentsProvider',
  dir: pactDir,
  logLevel: 'warn',
});

describe('Transaction API contract', () => {
  it('returns a list of transactions', async () => {
    await provider
      .addInteraction()
      .given('transactions exist')
      .uponReceiving('a request for the transaction list')
      .withRequest('GET', '/transactions')
      .willRespondWith(200, (builder) => {
        builder.headers({ 'Content-Type': 'application/json' });
        builder.jsonBody(
          eachLike({
            id: integer(1),
            amount: decimal(150.75),
            currency: string('BRL'),
            status: string('COMPLETED'),
            createdAt: iso8601DateTime('2026-10-29T12:00:00Z'),
          })
        );
      })
      .executeTest(async (mockServer) => {
        const client = new TransactionClient(mockServer.url);
        const transactions = await client.getTransactions();

        expect(Array.isArray(transactions)).toBe(true);
        expect(transactions.length).toBeGreaterThan(0);
        expect(transactions[0]).toHaveProperty('id');
        expect(transactions[0]).toHaveProperty('amount');
        expect(transactions[0]).toHaveProperty('currency');
        expect(transactions[0]).toHaveProperty('status');
      });
  });
});
