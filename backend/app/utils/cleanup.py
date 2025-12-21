import os
import glob

def clean_temp_folder(folder_path: str):
    files = glob.glob(f"{folder_path}/*")
    for f in files:
        try:
            os.remove(f)
        except OSError:
            pass