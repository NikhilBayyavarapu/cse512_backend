# To test locally follow the steps:

Ensure NodeJS is installed and run ```npm install``` to install all dependencies.

1) Run an elastic search server locally or in the cloud and save credentials.
2) Run ```node insert.js``` to insert data in the csv file to elasticsearch server
3) Then run ```node main.js``` to start the backend server.
4) Make sure this endpoint is the same as the end point used in frontend.
5) Make sure elasticsearch endpoint, and credentials are properly set.