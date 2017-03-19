[Serelex](http://www.serelex.org/) -- a lexico-semantic search engine
=======

This system is a kind of "lexico-semantic search engine". Given a text query it provides a list of related words. For instance, for the word "python" it will return words, such as "Ruby", "C++", "Java", "snake", "boa", etc. Instead, a traditional search engine provides as a results a list of related documents. The system provides visual interface to systems like word2vec. Originally, back to 2012, the system used a graph of related words derived based using the pattern-based semantic similarity measure [*PatternSim*](http://www.oegai.at/konvens2012/proceedings/23_panchenko12p/). Lated, in 2013, when word2vec was introduced, we added some models based on the Skip-Gram model. In principle, the system is able to represent results of any other method for computing similarities, as it takes as an input a *distributional thesaurus* represented in the form ```word_i<TAB>word_j<TAB>similarity_ij```. If you would like to know more about the system or would like to refer to it in a publication, please refer to the following paper:
 
Panchenko et al. (2013) [**Serelex: Search and visualization of semantically related words**.](http://link.springer.com/chapter/10.1007/978-3-642-36973-5_97). In Proceedings of the European Conference on Information Retrieval, ECIR'2013. Springer.

```latex
@inproceedings{panchenko2013serelex,
  title={Serelex: Search and visualization of semantically related words},
  author={Panchenko, Alexander and Romanov, Pavel and Morozova, Olga and Naets, Hubert and Philippovich, Andrey and Romanov, Alexey and Fairon, C{\'e}drick},
  booktitle={European Conference on Information Retrieval},
  pages={837--840},
  year={2013},
  organization={Springer}
}
```

API
---

All models can be accessed using the RESTful API.

- execute request GET /find/&lt;model&gt;/&lt;word&gt; to obtain results
- for instance  http://serelex.cental.be/find/norm60-corpus-all/ubuntu
- this request should return a set of words related to 'ubuntu' in JSON format

How to install
--------------

1. Install Node.JS (https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager).
2. Install MySQL.
3. Clone this repository (git clone ...).
4. Go to the directory with lsse and type "npm install" to install all Node.JS dependencies of the system.
5. Configure database access in `config.js` file
6. Use `lsse.sql` script to create tables.
6. Use PORT environment variable to set port (e.g. "export PORT=8080" for Linux, "set PORT=8080" for Windows). By default -- 80.
7. Start the application: "node app".

Additional: 

8. Use "node import_v2" to import all CSV files with semantic relations, described in data_models.js to MongoDB.
9. Use "node generate_access_log [count] [file name]" to generate access log for JMeter with random data.

Example insallation for Ubuntu 16.04
------------------------------------

```
# install the database
sudo apt install mysql-server mysql-client
wget http://panchenko.me/data/serelex/lsse-backup-28-12-2016.sql.gz
gunzip lsse-backup-28-12-2016.sql.gz 
mysql -u lsse -p -h localhost < lsse-backup-28-12-2016.sql
# mysql privilegies for the lsse user:
GRANT ALL ON *.* to 'lsse'@'localhost' identified with '';

# install the application 
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
https://github.com/PomanoB/lsse.git
cd lsse
sudo npm install

# run in a screen
cd ..
wget http://panchenko.me/data/serelex/serelex-restart.sh
sudo bash serelex-restart.sh

# run using supervisord
sudo apt-get install supervisor
sudo vim /etc/supervisor/conf.d/serelex.conf

# enter the following adjusting the path to the lsse directory (you also need to modify the path in s.sh):
[program:serelex]
command=/home/ubuntu/lsse/s.sh
autostart=true
autorestart=true
stderr_logfile=/home/ubuntu/serelex.err.log
stdout_logfile=/home/ubuntu/serelex.out.log

sudo supervisorctl reread
sudo supervisorctl update
```


