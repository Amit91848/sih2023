from .models import FlanModel, FlanT5_CT2
import os
import gc
import psutil



class Loader():

    def __init__(self):

        self.models = {}
        

    def load_transformer(self, model_name: str):
        if model_name not in self.models:
            self.models[model_name] = FlanModel(model_name)
 

    def load_ct2(self, model_name: str):
        if model_name not in self.models:
            self.models[model_name] = FlanT5_CT2(model_name)


    def unload_model(self, model_name):
        if model_name in self.models:
            # For CTranslate2 models
            if isinstance(self.models[model_name], FlanT5_CT2):
                self.models[model_name].translator.unload_model()

            # For Transformer models
            if isinstance(self.models[model_name], FlanModel):
                del self.models[model_name].model

            del self.models[model_name]
            gc.collect()


    def get_model(self, model_name):
        return self.models.get(model_name, None)
    

    def get_directory_size(path):
        total_size = 0
        for dirpath, dirnames, filenames in os.walk(path):
            for f in filenames:
                fp = os.path.join(dirpath, f)
                total_size += os.path.getsize(fp)
        return total_size


    def available_memory_percent(self):
        # Returns available memory as a percentage
        return psutil.virtual_memory().available * 100 / psutil.virtual_memory().total
    
    
    def get_available_memory(self):
        return psutil.virtual_memory().available