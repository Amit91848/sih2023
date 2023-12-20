import re

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
    

    def strip_after_last_full_stop(self, text: str) -> str:
        """
        Strip the text of everything after the last full stop that ends a sentence.

        :param text: text to be processed
        :type text: str

        :return: processed text
        :rtype: str
        """
        sentences = re.split(r'(?<=[.])\s', text)

        last_full_stop_index = next((i for i in reversed(range(len(sentences))) if sentences[i].endswith('.')), -1)

        if last_full_stop_index == -1:
            return text

        return ' '.join(sentences[:last_full_stop_index + 1]).strip()
    

    def clean_text(self, text:str) -> str:

        # Remove control characters
        cleaned = re.sub(r'\\x[0-9a-fA-F]{2,3}', '', text)

        # Replace newline with space
        # cleaned = cleaned.replace('\n', ' ')

        # Remove remaining sequence of special chars
        cleaned = re.sub(r'[\^>]+', ' ', cleaned)

        # Remove square brackets and content between them
        cleaned = re.sub(r'\[[^\]]*\]', '', cleaned)
        
        # Replace multiple spaces with a single space
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()

        # Remove last unfinished sentence
        # for i in range(len(cleaned)-1, -1, -1):
        #     if cleaned[i]==".":
        #         cleaned = cleaned[:i+1]
        #         break
        
        if cleaned[-1]!=".":
            cleaned = cleaned + "."
            
        return cleaned
    
    
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
                for sent in self.split_into_sentences(batch.strip()):
                    sentences.remove(sent)
                batch = ""
        
        if len(sentences)!=0:
            for sent in sentences:
                batch = batch + " " + sent
                batch = batch.strip()
            final_batches.append(batch)
        
        return final_batches