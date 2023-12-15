from prakat.batching import Batching
from prakat.models import FlanModel

class Grammar():
    
    def __init__(self, model_name:str="pszemraj/flan-t5-large-grammar-synthesis") -> None:
        '''
            Load Model and Batcher
        '''
        model = FlanModel(model_name)
        batching = Batching()

    def run_inference(self, prompt:str) -> str:
        '''
            Sends each prompt/batch to model and gets back correct individual output
        '''
        inputs = self.model.tokenizer(prompt, return_tensors="pt")
        output = self.model.generate(**inputs, max_new_tokens=128)
        return self.model.tokenizer.decode(output[0], skip_special_tokens=True)

    def grammar_check(self, text:str, batch_size:int=3) -> str:
        '''
            Takes input as raw text and batch size and gives out correct text
            Batch Size corresponds to number of sentences in each batch
        '''
        data = self.batching.split_into_sentences(text)
        output = []

        for i in range(0, len(data), batch_size):
            batch = data[i: i+batch_size]
            output.append(self.run_inference(''.join(batch)))
        
        return ''.join(output)