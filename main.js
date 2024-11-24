const express = require('express');
const path  = require('path');
const cors = require('cors');
const {Client} = require('@elastic/elasticsearch');
const { title } = require('process');
const { type } = require('os');

const app = express();
const port  = 8080;



const url = "use_your_elasticsearch_url";
const apikey = "use_api_key or password"

const esClient = new Client({node: url, auth: {apiKey: apikey},
    tls: {rejectUnauthorized: false}}); // change syntax in auth to username and password if you are using password else use apikey

app.use(express.json());
app.use(cors());


app.get('/search', async (req, res) => {
    try {
      const { keyword, category, publisher } = req.query;
  
      const must = [];
        if (keyword) {
            must.push({
                multi_match: {
                    query: keyword,
                    fields: ['title^3', 'authors^2', 'description', 'category'],
                    fuzziness: 'AUTO',
                    type: 'best_fields',
                },
            });
        }

        const filter = [];

        if (category) {
            filter.push({ term: { category } });
        }

        if (publisher) {
            filter.push({ term: { publisher } });
        }

        const query = {
            bool: {
                must: must.length > 0 ? must : { match_all: {} },
                filter,
            },
        };
    
      const response = await esClient.search({
        index: 'kagglebooks',
        body: {
          query,
          size: 5, 
          sort: [
            { "_score": { "order": "desc" } }  // Sort by score in descending order
          ]
        },
      });
  
      res.status(200).json(response.hits.hits.map((hit) => hit._source));
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
  

  app.post('/books', async (req, res) => {
    try {
      const {  title, authors, description, category, publisher } = req.body;
  
      // Validate required fields
      if (!title || !authors || !description || !category || !publisher) {
        return res.status(400).send('All fields are required.');
      }
  
      const response = await esClient.index({
        index: 'kagglebooks',
        body: { title, authors, description, category, publisher },
      });
  
      res.status(201).send({ message: 'Document created', response });
    } catch (error) {
      console.error('Error creating document:', error);
      res.status(500).send('An error occurred while creating the document.');
    }
  });
  
  

app.get('/', (req, res) => {  
    res.status(200).send("Hello World");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});