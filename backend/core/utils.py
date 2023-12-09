import secrets
import os

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
