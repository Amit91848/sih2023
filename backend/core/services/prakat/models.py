from .batching import Batching
from os import cpu_count
from transformers import AutoModelForSeq2SeqLM
from transformers import AutoTokenizer
from ctranslate2 import Translator, Generator
from core.types import BatchSize
from datasets import load_metric


# FlanModel
class FlanModel():

    def __init__(self, model_path: str,model_name: str, tokenizer_path: str=None) -> None:
        super().__init__()

        self.model_name = model_name

        if tokenizer_path==None:
            self.tokenizer_name = model_path
        else:
            self.tokenizer_name = tokenizer_path

        try:
            self.model = AutoModelForSeq2SeqLM.from_pretrained(model_path)

        except Exception as e:
            raise ValueError(f"Input file path is not a valid transformer model or name of huggingface repo.\n{e}")

        
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(self.tokenizer_name)

        except Exception as e:
            raise ValueError(f"Unable to load tokenizer from input model path, or not a valid huggingface repo.\n{e}")

        self.batcher = Batching()


    def inference(self, prompt: str, max_new_toks: int) -> str:
        inputs = self.tokenizer(prompt, return_tensors="pt")
        outputs = self.model.generate(**inputs, max_new_tokens=max_new_toks)
        return self.tokenizer.decode(outputs[0], skip_special_tokens=True)
    

    def summarize(self, text: str) -> str:
        text = self.batcher.clean_text(text)
        input_token_length = len(self.tokenizer.encode(text))
        max_len = int(input_token_length * 0.5)
        min_len = int(0.1 * input_token_length)
        prompt = 'summarize: ' + text
        inputs = self.tokenizer(prompt, return_tensors="pt")
        outputs = self.model.generate(
            **inputs, 
            max_length = max_len, 
            min_length = min_len, 
            num_beams = 4, 
            early_stopping = True, 
            do_sample = True,
            temperature = 0.3,
            length_penalty = 0.2, 
            no_repeat_ngram_size = 2
        )
        summary = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        return summary
    

    def batch_summarize(self, text: str, batch_size: int) -> str:
        text = self.batcher.clean_text(text)
        size = 2048
        if batch_size == BatchSize.LONG:
            size = 512
        elif batch_size == BatchSize.MEDIUM:
            size = 1024
        elif batch_size == BatchSize.SHORT:
            size = 2048
        batches = self.batcher.get_batches(text=text, batch_size=size)
        summaries = []
        for batch in batches:
            summary = self.summarize(batch)
            summaries.append(summary)

        full_summary = '\n'.join(summaries)
        return full_summary
    

    def grammar_check(self, text: str, beam_count: int=6) -> str:
        text = self.batcher.clean_text(text)
        input_token_length = len(self.tokenizer.encode(text))
        inputs = self.tokenizer(text, return_tensors="pt")
        outputs = self.model.generate(
            **inputs, 
            max_length = input_token_length, 
            num_beams = beam_count, 
            early_stopping = True, 
            do_sample = True,
            temperature = 0.3,
        )
        summary = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        return summary


    def set_grammar_check(self, text: str, set_count: int) -> str:
        text = self.batcher.clean_text(text)
        sentence_sets = self.batcher.get_sets(text=text, set_size=set_count)
        checked = []
        for sentence_set in sentence_sets:
            correction = self.grammar_check(sentence_set)
            checked.append(correction)

        full_correction = ' '.join(checked)
        return full_correction
    
    def get_model_name(self):
        return self.model_name




class FlanT5_CT2():

    def __init__(self, model_path: str, tokenizer_path: str, model_name: str) -> None:
        super().__init__()

        self.model_path = model_path
        self.cpu_cores = cpu_count()
        self.model_name = model_name

        try:
            self.translator =  Translator(model_path, device='cpu', inter_threads=self.cpu_cores)
        
        except Exception as e:
            raise ValueError(f"Could not load CT2 model from given filepath\n{e}")
        
    
        try: 
            self.tokenizer = AutoTokenizer.from_pretrained(tokenizer_path)

        except Exception as e:
            raise ValueError(f"Entered tokenizer_path is not a valid tokenizer model path or a valid huggingface repo.\n{e}")
        
        
        self.batcher = Batching()
        

    def inference(self, text: str) -> str:
        input_tokens = self.tokenizer.convert_ids_to_tokens(self.tokenizer.encode(text))

        results = self.translator.translate_batch(
            [input_tokens], 
        )

        output_tokens = results[0].hypotheses[0]
        output_text = self.tokenizer.decode(self.tokenizer.convert_tokens_to_ids(output_tokens))

        return output_text
    

    def summarize(self, text: str) -> str:
        text = self.batcher.clean_text(text)
        prompt = 'summarize: ' + text.strip()
        input_tokens = self.tokenizer.convert_ids_to_tokens(self.tokenizer.encode(prompt))

        results = self.translator.translate_batch(
            [input_tokens], 
            length_penalty = 2,
            coverage_penalty = 0.2,
            repetition_penalty= 1.8,
        )

        output_tokens = results[0].hypotheses[0]
        output_text = self.tokenizer.decode(self.tokenizer.convert_tokens_to_ids(output_tokens))

        return output_text
    

    def batch_summarize(self, text: str, batch_size: int, is_output: bool=False) -> str:
        size = 2048
        if batch_size == BatchSize.LONG:
            size = 512
        elif batch_size == BatchSize.MEDIUM:
            size = 1024
        elif batch_size == BatchSize.SHORT:
            size = 2048
        if is_output:
            text = self.batcher.clean_text(text=text)
        else:
            text = self.batcher.clean_text(text=text)
        batches = self.batcher.get_batches(text=text, batch_size=size)
        print(batches)
        summaries = []
        for batch in batches:
            summary = self.summarize(batch)
            summaries.append(summary)

        full_summary = '\n'.join(summaries)
        bleu_score = self.get_bleu_score(text, full_summary)
        return full_summary, bleu_score
    
    def get_bleu_score(self, original:str, summary:str)-> float:
        sacrebleu = load_metric("sacrebleu")
        result = sacrebleu.compute(predictions=[summary], references=[[original]])
        score = round(result['score']/100, 2)
        return score
    

    def batch_summarize_native(self, text: str, token_batch_size: int) -> str:
        text = self.batcher.clean_text(text)
        input_tokens = self.tokenizer.convert_ids_to_tokens(self.tokenizer.encode(text))

        results = self.translator.translate_batch(
            [input_tokens], 
            length_penalty = 2,
            coverage_penalty = 0.2,
            repetition_penalty= 1.8,
            max_batch_size = token_batch_size,
            batch_type = 'tokens'
        )

        output_tokens = results[0].hypotheses[0]
        output_text = self.tokenizer.decode(self.tokenizer.convert_tokens_to_ids(output_tokens))

        return output_text
    

    def grammar_check(self, text: str):
        text = self.batcher.clean_text(text)
        input_tokens = self.tokenizer.convert_ids_to_tokens(self.tokenizer.encode(text))

        results = self.translator.translate_batch(
            [input_tokens],
            length_penalty = 1,
            beam_size = 6,
            patience = 1.2
        )

        output_tokens = results[0].hypotheses[0]
        output_text = self.tokenizer.decode(self.tokenizer.convert_tokens_to_ids(output_tokens))

        return output_text
    

    def set_grammar_check(self, text: str, set_count: int):
        for i in range(len):
            text[i] = self.batcher.clean_text(text[i])
            
        sentence_sets = self.batcher.get_sets(text=text, set_size=set_count)
        checked = []
        for sentence_set in sentence_sets:
            correction = self.grammar_check(sentence_set)
            checked.append(correction)

        full_correction = ' '.join(checked)
        return full_correction
    
    def get_model_name(self):
        return self.model_name
    



class Generator_CT2():


    def __init__(self, model_path: str, tokenizer_path: str, model_name: str) -> None:
        super().__init__()

        self.model_path = model_path
        self.model_name = model_name
        self.cpu_cores = cpu_count()

        try:
            self.generator =  Generator(model_path, device='cpu', inter_threads=self.cpu_count)
        
        except Exception as e:
            raise ValueError(f"Could not load CT2 model from given filepath\n{e}")
        
    
        try: 
            self.tokenizer = AutoTokenizer.from_pretrained(tokenizer_path)

        except Exception as e:
            raise ValueError(f"Entered tokenizer_path is not a valid tokenizer model path or a valid huggingface repo.\n{e}")
        
        
        self.batcher = Batching()


    def inference(self, query: str, sys_msg: str="", context: str="") -> str:
        prompt = f"<SYS>{sys_msg}</SYS>\n<Context>{context}</Context>\nQ: {query}\nA: "

        tokens = self.tokenizer.convert_ids_to_tokens(self.tokenizer.encode(prompt))

        results = self.generator.generate_batch(
            [tokens], 
            beam_size = 4,
            repetition_penalty = 1.5,
            length_penalty = 1.5
        )
        
        output = self.tokenizer.decode(results[0].sequences_ids[0])
        return output
    
    def get_model_name(self):
        return self.model_name