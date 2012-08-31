lsse
====

Name
----
Serelex - lexico-semantic search engine

How to install
--------------

1. Install Node.JS
2. Install MongoDB
3. Clone this repo
4. Go to dir with lsse and type "npm install" to install all dependencies
5. Use mongorestore util to restore data: "mongorestore backup" where backup is folder with directory serelex, contain files system.indexes.bson and words.bson
6. Run: "node app"
7. Use "node import" to import all CSV files, described in data_models.js to MongoDB
8. Use "node generate_access_log [count] [file name]" to generate access log for JMeter with random data

API
---

Execute request GET /find/<model>/<word> to obtain results