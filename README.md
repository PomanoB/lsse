Lexico-Semantic Search Engine
=============================

Name
----
Serelex - lexico-semantic search engine

How to install
--------------

1. Install Node.JS (Ubuntu -- https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager).
2. Install MongoDB (Ubuntu -- http://docs.mongodb.org/manual/tutorial/install-mongodb-on-debian-or-ubuntu-linux/).
3. Clone this repository (git clone ...).
4. Go to the directory with lsse and type "npm install" to install all Node.JS dependencies of the system.
5. Use mongorestore tool to restore databases: "mongorestore backup" where backup is folder with directory serelex, contain files system.indexes.bson and words.bson. Downloadable here -- http://cental.fltr.ucl.ac.be/team/~panchenko/data/serelex/mongodb.tgz.
6. Start the application: "node app".
7. Use "node import" to import all CSV files, described in data_models.js to MongoDB
8. Use "node generate_access_log [count] [file name]" to generate access log for JMeter with random data
9. Use PORT environment variable to set port for using 

API
---

Execute request GET /find/&lt;model&gt;/&lt;word&gt; to obtain results