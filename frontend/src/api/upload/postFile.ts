import { BACKEND_URL } from "@/lib/utils"

export const postFile = async (file: File) => {
  const res = await fetch(`${BACKEND_URL}/upload/`, {
    method: "POST",
    body: file
  });
  
  const fileRes = await res.json();

  return fileRes;
}
