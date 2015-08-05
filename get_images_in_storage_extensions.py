#!/usr/bin/python

import os
import csv
import argparse
from azure.storage import BlobService

container = 'images'
account_name='xxxx'
account_key='xxxx'


if __name__ == "__main__":
	parser = argparse.ArgumentParser(description='Lists all blob in the container and save information about extensions')
	parser.add_argument("filename", help='File to write results')
	
	args = parser.parse_args()	
	
	blob_service = BlobService(account_name=account_name, account_key=account_key)
	
	blobs = blob_service.list_blobs(container)
	
	with open(args.filename, 'w') as f:
		writer = csv.writer(f)
	 	
		for b in blobs:
			word_data = os.path.splitext(b.name)
			writer.writerow(word_data)
		
