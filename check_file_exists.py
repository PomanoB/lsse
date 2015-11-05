import argparse
import os
import shutil
import sys


def main(folder_main, folder_extra, folder_out):
    try:
        files_extra = os.listdir(folder_extra)
        files_main = os.listdir(folder_main)
        number_of_files = 0

        basenames_extra = []
        basenames_main = []
             
        for fname in files_main:            
            basenames_main.append(os.path.splitext(os.path.basename(fname))[0]) 
        
        for fname in files_extra:
            file_name, file_extension = os.path.splitext(fname)
            if file_name in basenames_main:
                pass
            else:                 
                shutil.copy(folder_extra + "/" + fname, folder_out +"/" + fname)
                number_of_files = number_of_files + 1

        print "Number of files copied: ", number_of_files 

    except:
        e = sys.exc_info()[0]
        "Error while copying the files :", e


if __name__ == "__main__":
    
    parser = argparse.ArgumentParser(" Copying files to the output folder")
    parser.add_argument("main_loc", help="Full path to the main folder")
    parser.add_argument("extra_loc", help=" Full path to the extra folder")
    parser.add_argument("out_loc", help=" Full path to the output folder")
    
    args = parser.parse_args()
    folder_main = args.main_loc
    folder_extra = args.extra_loc
    folder_out = args.out_loc
    
    try:
        if not os.path.exists(folder_main):
            print "main_loc directory not found."
            sys.exit(0)
        if not os.path.exists(folder_extra):
            print "extra_loc directory not found."
            sys.exit(0)
        if not os.path.exists(folder_out):
            os.makedirs(folder_out)
    
        main(folder_main, folder_extra, folder_out)
    except :
        e = sys.exc_info()[0]
        print "Error while creating the input/output folders ", e
    
