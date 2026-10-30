const express = require('express');

const seed = () => [
  {
    id: 1,
    amount: 150.75,
    currency: 'BRL',
    status: 'COMPLETED',
    createdAt: '2026-10-29T12:00:00Z',
  },
];

function createApp() {
  const app = express();
  let transactions = seed();

  app.get('/transactions', (req, res) => {
    res.json(transactions);
  });

  return {
    app,
    setTransactions(next) {
      transactions = next;
    },
    reset() {
      transactions = seed();
    },
  };
}

function startProvider(port = 0) {
  const { app, setTransactions, reset } = createApp();
  return new Promise((resolve) => {
    const server = app.listen(port, '127.0.0.1', () => {
      resolve({
        server,
        port: server.address().port,
        setTransactions,
        reset,
        close: () => new Promise((done) => server.close(done)),
      });
    });
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  startProvider(port).then(({ port: p }) => {
    console.log(`PaymentsProvider listening on http://127.0.0.1:${p}`);
  });
}

module.exports = { createApp, startProvider };
