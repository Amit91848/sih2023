from fastapi import APIRouter, Request
from core.utils import success_response

import os, psutil, GPUtil; 

router = APIRouter()


def get_gpu_memory_usage():
    try:
        gpu = GPUtil.getGPUs()[0]
        return gpu.memoryFree, gpu.memoryUsed, gpu.memoryTotal
    except Exception as e:
        # print(f"Error getting GPU memory usage: {e}")
        return None

def get_pid_by_name(process_name):
    for proc in psutil.process_iter(['pid', 'name']):
        if proc.info['name'] == process_name:
            return proc.info['pid']

@router.get("/info")
async def get_compute(request: Request):
    pid = os.getpid()
    # print(pid)
    process = psutil.Process(pid)
    ram = process.memory_info().rss / 1024  ** 2
    cpu_percent = process.cpu_percent(interval=1)
    # cpu_percent2 = process.cpu_percent(interval=None)
    gpu_memory_usage = get_gpu_memory_usage()
    # print(f"Ram: {ram}")
    # print(f"CPU: {cpu_percent}")

    model_name = None
    state = request.app.state
    
    if state and hasattr(state, "current_model"):
        if state.current_model is not None:
            model_name = state.current_model.get_model_name()

    data = {
        "ram": f"{ram:.2f}",
        "cpu": cpu_percent,
        "gpu": gpu_memory_usage,
        "model_name": model_name
    }

    return success_response(data=data)
    
