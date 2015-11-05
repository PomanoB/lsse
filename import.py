# -*- coding: iso-8859-1 -*-
# import arg
import MySQLdb
import csv
import sys
from sys import argv
import os
import codecs
from traceback import format_exc
import argparse
from time import time 

VERBOSE = False
CHUNK_SIZE = 200000
# con.query('SET GLOBAL connect_timeout=28800')


db = MySQLdb.connect("127.0.0.1","lsse","","lsse", charset='utf8', init_command='SET NAMES UTF8')
cursor = db.cursor()
word_id_hash = {}
#word_id_hash = UTF8Dict()
overall_relations_row_list = []


def read_input_csv(input_file, model_id, lang):
    relations_added = 0
    words_each_row = []
    list_word = []
    relations_tuple = ()
    if os.path.isfile(input_file):
        csv_input_file = codecs.open(input_file,'r','utf-8')
        err_num = 0 
        for i, line in enumerate(csv_input_file):
            if i % 10000 == 0: print i
            try:
                #print line
                row = line.strip().split("\t")
		#if row[0].find("/") == -1:
		#	tmp_word = row[0]
		#else:
		tmp_word = row[0].split("/")
                word = tmp_word[0].lower()
		#if row[1].find("/") == -1:
		#	tmp_relation = row[1]
		#else:
		tmp_relation = row[1].split("/")
                relation = tmp_relation[0].lower()
                frequency = row[2]
                #print frequency
                #print word, relation
                #print type(word), type(relation)
                #print "Word:", MySQLdb.escape_string(word)
                
                #check_word_exists(MySQLdb.escape_string(word), model_id, lang)
                check_word_exists(word, model_id, lang)
                #print "Relation:", relation.encode('utf-8')
                #check_word_exists(MySQLdb.escape_string(relation), model_id, lang)
                check_word_exists(relation, model_id, lang)
                del list_word[:]
                
                hash_word = (int(word_id_hash[word]),)
                list_word = list(hash_word)
                list_word.append(int(model_id))
                list_word.append(int(word_id_hash[relation]))
                
                if "," in frequency:
                    frequency = frequency.replace(",",".")
                list_word.append(float(frequency))
                relations_tuple = tuple(list_word)
                                
                overall_relations_row_list.append(relations_tuple)
                # ','.join(ovearall_relations_row_list)
                if len(overall_relations_row_list) == CHUNK_SIZE:
                    relations_added = relations_added + len(overall_relations_row_list)
                    insert_relations(str(overall_relations_row_list).strip('[]'), relations_added)
                    del overall_relations_row_list[:]
                
                else:
                    continue
            except KeyboardInterrupt:
                sys.exit()
            except Exception, e:
                print e
                if VERBOSE:
                    print "Error:", line
                    print format_exc()
                err_num += 1 
        print "Number of errors:", err_num
        relations_added = relations_added + len(overall_relations_row_list)
        insert_relations(str(overall_relations_row_list).strip('[]'), relations_added)
        del overall_relations_row_list[:]
                 
        
    else:
        print "File does not exist"

def insert_relations(relations_val, relations_added):    
    sql = "INSERT INTO relations(word, model, relation, value) VALUES "+relations_val    
    cursor.execute(sql)
    db.commit()
    #print "SQL",sql
    print "Relations inserted successfully."
    print "The number of relations added till now:", relations_added
    



def check_word_exists(word, model_id, lang):     
    row = ""
    word_exists_in_hash = False        
    sql = "SELECT * from words WHERE word='" + word + "' AND lang='" + lang + "'"    
    cursor.execute(sql)    
    if cursor.rowcount != 1:        
        row = insert_new_word(word, lang)        
    else:
        row = cursor.fetchone()    
    
    if word in word_id_hash:
        word_exists_in_hash = True
       
    if word_exists_in_hash == False:        
        word_id_hash[word.lower()] = row[0]    
        
       


def insert_new_word(word, lang):
    sql = "INSERT INTO words(word, lang) VALUES('" + word + "','" + lang + "')"    
    cursor.execute(sql)
    db.commit()
    
    sql = "SELECT * from words WHERE word='" + word + "' AND lang='" + lang + "'"
    cursor.execute(sql)
    if cursor.rowcount == 1:
        row = cursor.fetchone()
        return row            
    
            

def insert_model(model, lang):    
    print "No models with the name:", model
    sql = "INSERT INTO models(name, lang) VALUES('" + model + "','" + lang + "')"
    cursor.execute(sql)
    db.commit()
    print "Model:" + model + " added successfully."            
     


def check_model(model, lang):
    sql = "SELECT id FROM models WHERE name='" + model +"' AND lang='" + lang + "'"
    cursor.execute(sql)
    if cursor.rowcount == 1:
        row_model = cursor.fetchone()        
        return row_model[0]
    else:
        return -1
        

def display_all_models():
    sql = "SELECT * FROM models"
    cursor.execute(sql)
    result = cursor.fetchall()
    if cursor.rowcount == 0:
        print "There are no models in the database."
    else:
        print "ID", "Model Name", "Language"
        for row in result:
            print row[0], row[1], row[4]
        id_model = raw_input("\nEnter the model id to delete:");
        delete_model(id_model) 


def delete_model(id_model):
    sql_check_model = "SELECT * FROM `models` where id = %s" %(id_model)
    sql_model = "DELETE FROM `models` where id = %s" %(id_model)
    sql_relations = "DELETE FROM `relations` where model = %s" %(id_model)    
    try:
        cursor.execute(sql_check_model)
        result = cursor.fetchall()
        if cursor.rowcount == 1:
            cursor.execute(sql_relations)
            db.commit()
            cursor.execute(sql_model)
            db.commit()
            print "The model and its relations have been deleted successfully."
        else:
            print "There is no model with the id " + id_model
    except Exception, e:
        print "Error while deleting the model having the model-id ", sys.exc_info()
    

if __name__ == "__main__":
    operation_option = raw_input("Operations on the database: 1. Press 1 to add a model  2. Press 2 to delete a model : ")
    if operation_option == "1":
        input_string = raw_input("Enter the full path to the input csv, name of the model, language of the model separated by commas. Eg: /home/name/input.csv, Large Model, en:")
        input_arr = input_string.split(",")
        if(len(input_arr) == 3):
            input_file = input_arr[0]
            
            model = input_arr[1]
            model = model.replace(" ","_")
               
            lang = input_arr[2]

            model_id = check_model(model, lang) 
            if model_id == -1:
                insert_model(model, lang)
                model_id = check_model(model,lang)
            read_input_csv(input_file, model_id, lang)
        else:
            print "Enter the input parameters correctly."
    elif operation_option == "2":
        display_all_models()
    else:
        print "You have entered an incorrect option."
