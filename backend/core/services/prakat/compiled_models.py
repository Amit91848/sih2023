# from mlc_chat import ChatModule, GenerationConfig
# from mlc_chat.callback import StreamToStdout



# class MLC_Model():

#     def __init__(self, model_name: str, model_lib_file: str):

#         self.model_name = model_name
#         self.model_lib_path = model_lib_file

#         try:
#             self.model = ChatModule(model=self.model_name, model_lib_path=self.model_lib_path)

#         except Exception as e:
#             raise ValueError(f"Failed to load model from input model_name and model_lib_file parameter values.\n{e}")
        

#     def inference(self, query: str, sys_msg: str="", context: str="", max_len: int=256, temp: int=0.6, repeat_penalty: int=1.3):

#         prompt = f"<SYS>{sys_msg}</SYS>\n<Context>{context}</Context>\nQ: {query}\nA: "
        
#         gen_config = GenerationConfig(
#             max_gen_len=max_len,
#             temperature=temp,
#             repetition_penalty=repeat_penalty
#         )

#         output = self.model.generate(
#             prompt=prompt,
#             generation_config=gen_config
#         )

#         return output