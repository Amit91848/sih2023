from llama_cpp import Llama


class LocalModel():


    def __init__(self, gguf_filepath: str, context_window: int=1024) -> None:

        self.context_window = context_window

        if gguf_filepath.endswith(".gguf"):
            self.model_filepath = gguf_filepath
        else:
            raise ValueError("Not GGUF llm model.")


        try:
            self.llm = Llama(self.model_filepath, 
                             n_ctx=self.context_window
                        )

        except Exception as e:
            raise ValueError(f"Failure to load model from filepath: {e}")



    def inference(self, query: str,  sys_msg: str="", context: str="", temp: float=0.6, rep_penalty: float=1.1, max_tokens: int=128, top_k: int=30) -> str:

        if sys_msg=="":
            sys_prompt = ""
        else:
            sys_prompt = f"<SYS>{sys_msg}</SYS>"

        if context=="":
            context_prompt = ""
        else: 
            context_prompt = f"<Context>{context}</Context>"

        prompt = ('\n'.join([sys_prompt, context_prompt, "Q: {query}\nA: "])).lstrip()

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