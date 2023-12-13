import re
from transformers import AutoModelForSeq2SeqLM
from transformers import AutoTokenizer



class Batching():

    def __init__(self):
        self.alphabets= "([A-Za-z])"
        self.prefixes = "(Mr|St|Mrs|Ms|Dr)[.]"
        self.suffixes = "(Inc|Ltd|Jr|Sr|Co)"
        self.starters = "(Mr|Mrs|Ms|Dr|Prof|Capt|Cpt|Lt|He\s|She\s|It\s|They\s|Their\s|Our\s|We\s|But\s|However\s|That\s|This\s|Wherever)"
        self.acronyms = "([A-Z][.][A-Z][.](?:[A-Z][.])?)"
        self.websites = "[.](com|net|org|io|gov|edu|me)"
        self.digits = "([0-9])"
        self.multiple_dots = r'\.{2,}'

    def split_into_sentences(self, text: str) -> list[str]:
        """
        Split the text into sentences.

        If the text contains substrings "<prd>" or "<stop>", they would lead 
        to incorrect splitting because they are used as markers for splitting.

        :param text: text to be split into sentences
        :type text: str

        :return: list of sentences
        :rtype: list[str]
        """
        text = " " + text + "  "
        text = text.replace("\n"," ")
        text = re.sub(self.prefixes,"\\1<prd>",text)
        text = re.sub(self.websites,"<prd>\\1",text)
        text = re.sub(self.digits + "[.]" + self.digits,"\\1<prd>\\2",text)
        text = re.sub(self.multiple_dots, lambda match: "<prd>" * len(match.group(0)) + "<stop>", text)
        if "Ph.D" in text: text = text.replace("Ph.D.","Ph<prd>D<prd>")
        text = re.sub("\s" + self.alphabets + "[.] "," \\1<prd> ",text)
        text = re.sub(self.acronyms+" "+self.starters,"\\1<stop> \\2",text)
        text = re.sub(self.alphabets + "[.]" + self.alphabets + "[.]" + self.alphabets + "[.]","\\1<prd>\\2<prd>\\3<prd>",text)
        text = re.sub(self.alphabets + "[.]" + self.alphabets + "[.]","\\1<prd>\\2<prd>",text)
        text = re.sub(" "+self.suffixes+"[.] "+self.starters," \\1<stop> \\2",text)
        text = re.sub(" "+self.suffixes+"[.]"," \\1<prd>",text)
        text = re.sub(" " + self.alphabets + "[.]"," \\1<prd>",text)
        if "”" in text: text = text.replace(".”","”.")
        if "\"" in text: text = text.replace(".\"","\".")
        if "!" in text: text = text.replace("!\"","\"!")
        if "?" in text: text = text.replace("?\"","\"?")
        text = text.replace(".",".<stop>")
        text = text.replace("?","?<stop>")
        text = text.replace("!","!<stop>")
        text = text.replace("<prd>",".")
        sentences = text.split("<stop>")
        sentences = [s.strip() for s in sentences]
        if sentences and not sentences[-1]: sentences = sentences[:-1]
        return sentences
    

    def get_sets(self, text:str, set_size:int) -> list:
        
        sentences = self.split_into_sentences(text)

        fullset = []

        for i in range(0, len(sentences), set_size):
            sentence_set = sentences[i:i+set_size]
            fullset.append(sentence_set)

        return fullset
                

    
    def get_batches(self, text:str, batch_size:int) -> list[str]:
        
        sentences = self.split_into_sentences(text)

        final_batches = []
        batch = ""
        for sentence in sentences:
            if len(batch+" "+sentence) <= batch_size:
                batch = batch + " " + sentence
                batch = batch.strip()
            else:
                final_batches.append(batch.strip())
                batch = ""
        
        return final_batches
    




class FlanModel():

    def __init__(self, model_name, tokenizer_name) -> None:
        self.model_name = model_name
        self.tokenizer_name = tokenizer_name
        self.model = AutoModelForSeq2SeqLM.from_pretrained(self.model_name)
        self.tokenizer = AutoTokenizer.from_pretrained(self.tokenizer_name)
        self.batcher = Batching()

    def inference(self, prompt: str, max_new_toks: int) -> str:
        inputs = self.tokenizer(prompt, return_tensors="pt")
        outputs = self.model.generate(**inputs, max_new_tokens=max_new_toks)
        return self.tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    def summarize(self, text: str) -> str:
        input_token_length = len(self.tokenizer.encode(text))
        max_len = int(input_token_length) - 1
        min_len = int(0.2 * input_token_length)
        prompt = 'summarize: ' + text
        inputs = self.tokenizer(prompt, return_tensors="pt")
        outputs = self.model.generate(
            **inputs, 
            max_length = max_len, 
            min_length = min_len, 
            num_beams = 4, 
            early_stopping = True, 
            do_sample = True,
            temperature = 0.7,
            length_penalty = 0.6, 
            no_repeat_ngram_size = 2
        )
        summary = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        return summary
    

    def batch_summarize(self, text: str, batch_size: int):
        batches = self.batcher.get_batches(text=text, batch_size=batch_size)
        summaries = []
        for batch in batches:
            summary = self.summarize(batch)
            summaries.append(summary)

        full_summary = '\n'.join(summaries)
        return full_summary
    
    def unload_model(self):
        # Unload or release resources associated with the model
        # For CPU, simply delete the reference to the model
        del self.model


