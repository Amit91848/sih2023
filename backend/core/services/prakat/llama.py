from .models import Model
# from llama_cpp import Llama


class LocalModel(Model):


    def __init__(self, gguf_filepath: str, context_window: int) -> None:
        super().__init__()

        self.context_window = context_window

        if gguf_filepath.endswith(".gguf"):
            self.model_filepath = gguf_filepath
        else:
            raise ValueError("Not GGUF llm model.")
        

        # try:
            # self.llm = Llama(self.model_filepath)
        
        # except Exception as e:
            # raise ValueError(f"Failure to load model from filepath: {e}")
        


    def inference(self, query: str,  sys_prompt: str="", context: str="", temp: float=0.6, rep_penalty: float=1.1, max_tokens: int=128, top_k: int=30) -> str:

        prompt = f"<SYS>{sys_prompt}</SYS>\n<Context>{context}</Context>\nQ: {query}\nA: "
        input_tokens = self.llm.tokenize(prompt.encode('utf-8'))
        token_length = len(input_tokens)

        if (token_length>self.context_window):
            raise ValueError(f"Input token length of {token_length} is higher then context window {self.context_window}.")
        
        output = self.llm(
            prompt=prompt,
            temperature=temp,
            repeat_penalty=rep_penalty,
            max_tokens=max_tokens, 
            top_k=top_k
        )
        
        return output['choices'][0]['text']
    
