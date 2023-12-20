import enum

class BatchSize(enum.IntEnum):
    LONG = 1
    MEDIUM = 2
    SHORT = 3
    SHORTER = 0
    
class Status(enum.StrEnum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    FAILED = "FAILED"
    SUCCESS = "SUCCESS"