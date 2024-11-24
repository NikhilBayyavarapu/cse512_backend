const fs = require('fs');
const csv = require('csv-parser');
const { Client } = require('@elastic/elasticsearch');

const url = "use_your_elasticsearch_url";
const apikey = "use_api_key or password"

const esClient = new Client({node: url, auth: {apiKey: apikey},
    tls: {rejectUnauthorized: false}}); // change syntax in auth to username and password if you are using password else use apikey

const INDEX_NAME = 'kagglebooks';

async function insertData() {
  const books = [];
  const BATCH_SIZE = 1000;

  // Read CSV and prepare valid data
  fs.createReadStream('BooksDataset.csv')
    .pipe(csv())
    .on('data', (row) => {
      const {Title,Authors,Description,Category,Publisher} = row;

      // Check for empty fields (ignore rows with missing values)
      if (Title &&Authors && Description && Category && Publisher) {
        books.push({
          index: { _index: INDEX_NAME },
        });
        books.push({
          title: Title.trim(),
          authors: Authors.trim(),
          description: Description.trim(),
          category: Category.trim(),
          publisher: Publisher.trim(),
        });
      }
    })
    .on('end', async () => {
      if (books.length === 0) {
        console.log('No valid data to insert.');
        return;
      }

      // Insert data in bulk
      try {
        for (let i = 0; i < books.length; i += BATCH_SIZE * 2) {
            const chunk = books.slice(i, i + BATCH_SIZE * 2);
            const { body: bulkResponse } = await esClient.bulk({
              refresh: true,
              body: chunk,
            });
        }
      } catch (error) {
        console.error('Error inserting data:', error);
      }
    });
}

insertData();
