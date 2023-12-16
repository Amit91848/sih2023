import secrets
import os, re

KB = 1024
MB = 1024 * KB

SUPPORTED_FILE_TYPES = {
    'application/pdf': 'pdf'
}


def generate_random_file_name(file_name: str):
    file_base_name, file_extension = os.path.splitext(file_name)
    random_string = secrets.token_hex(20 // 2)
    return f"{random_string}_{file_base_name}{file_extension}"


def success_response(data=None):
    """
    Generates a standardized success response.
    """
    return {"success": True, "data": data}


def error_response(code, message: str):
    """
    Generates a standardized error response.
    """
    return {"success": False, "error": {"code": code, "message": message}}

def clean_text(text:str) -> str:
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
    for i in range(len(cleaned)-1, -1, -1):
        if cleaned[i]==".":
            cleaned = cleaned[:i+1]
            break
        
    return cleaned
