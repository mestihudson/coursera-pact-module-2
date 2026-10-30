const { Verifier } = require('@pact-foundation/pact');
const { startProvider } = require('../src/server');

let provider;

beforeAll(async () => {
  provider = await startProvider(0);
});

afterAll(async () => {
  await provider.close();
});

describe('PaymentsProvider contract verification', () => {
  it('satisfies the TransactionConsumer pact', async () => {
    const options = {
      provider: 'PaymentsProvider',
      providerBaseUrl: `http://127.0.0.1:${provider.port}`,
      pactBrokerUrl: process.env.PACT_BROKER_BASE_URL || 'http://localhost:9292',
      consumerVersionSelectors: [{ mainBranch: true }, { deployedOrReleased: true }],
      publishVerificationResult: process.env.CI === 'true',
      providerVersion: process.env.GIT_COMMIT || '1.0.0',
      providerVersionBranch: process.env.GIT_BRANCH || 'main',
      logLevel: 'warn',
      stateHandlers: {
        'transactions exist': async () => {
          provider.setTransactions([
            {
              id: 1,
              amount: 150.75,
              currency: 'BRL',
              status: 'COMPLETED',
              createdAt: '2026-10-29T12:00:00Z',
            },
          ]);
          return 'transactions seeded';
        },
      },
    };

    if (process.env.PACT_BROKER_USERNAME) {
      options.pactBrokerUsername = process.env.PACT_BROKER_USERNAME;
      options.pactBrokerPassword = process.env.PACT_BROKER_PASSWORD;
    }

    await new Verifier(options).verifyProvider();
  }, 60000);
});
