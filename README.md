Lexico-Semantic Search Engine
=============================

Name
----
Serelex - a lexico-semantic search engine. 

This system is a kind of "lexico-semantic search engine". Given a text query it provides a list of related words.
A traditional search engine provides as a results a list of related documents. The current version is based on two 
semantic similarity measures -- Serelex and PatternSim. The first relies on definitions of words, while the second 
relies on a text corpus.

How to install
--------------

1. Install Node.JS (Ubuntu -- https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager).
2. Install MongoDB (Ubuntu -- http://docs.mongodb.org/manual/tutorial/install-mongodb-on-debian-or-ubuntu-linux/).
3. Clone this repository (git clone ...).
4. Go to the directory with lsse and type "npm install" to install all Node.JS dependencies of the system.
5. Use mongorestore tool to restore databases: "mongorestore backup", where "backup" is a folder with directory serelex2, containing files system.indexes.bson, words.bson and relations.bson. Downloadable here -- http://cental.fltr.ucl.ac.be/team/~panchenko/data/serelex/mongodb.tgz.
If indexes were not generated automatically, please do 
  - $mongo
  - >use serelex2
  - >db.words.ensureIndex({word: 1})
  - >db.words.ensureIndex({id: 1})
  - >db.relations.ensureIndex({word: 1, model: 1})
  - >db.lemms.ensureIndex({lemma: 1}, {unique:true})
  - >db.lemms.ensureIndex({forms: 1})
6. Use PORT environment variable to set port (e.g. "export PORT=8080" for Linux, "set PORT=8080" for Windows). By default -- 80.
7. Start the application: "node app".

Additional: 

8. Use "node import_v2" to import all CSV files with semantic relations, described in data_models.js to MongoDB.
9. Use "node generate_access_log [count] [file name]" to generate access log for JMeter with random data.


API
---

Execute request GET /find/&lt;model&gt;/&lt;word&gt; to obtain results