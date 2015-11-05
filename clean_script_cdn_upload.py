import re
import os
import shutil
from sys import argv
import sys

file_extensions = ["jpg","gif","jpeg","svg","png","bmp","tiff"]
if len(sys.argv) < 2:
    print ("How to run the file?")
    print ("argv[1]:Folder where all the images are present")
    print ("argv[2]:Folder to which all the files with unnecessary extensions have to be moved into.")
    exit(0)


root_folder = argv[1]
new_dir = argv[2]
if not os.path.exists(argv[2]):
    os.makedirs(argv[2])
bool_file = False
for root_dir, directories, files in os.walk(root_folder):
    for name in files:
        bool_file = False
        for ext in file_extensions:
            if(name.lower().find("."+ext)>-1):
                bool_file = True
                split_file_name = name.split(".")
                os.rename(root_dir+"/"+name,root_dir+"/"+str(split_file_name[0])+"."+ext)
                break
        if(bool_file == False):
            shutil.move(root_dir+"/"+name,new_dir+"/"+name)
