var util = require('util');
var async = require('async');
var fs = require('fs');

var mongo = require('mongodb'),
	Server = mongo.Server,
	Db = mongo.Db;

var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('serelex2', server);

var mysql = require('mysql');

var stats = JSON.parse(fs.readFileSync('./stats.json'));

console.log(stats);