import os 
import pyutil


class Model():
    def __init__(self):
        self.cpu_cores = os.cpu_count()

        