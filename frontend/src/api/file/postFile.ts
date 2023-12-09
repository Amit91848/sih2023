import { BACKEND_URL, HEADER_TOKEN, cAxios } from "@/lib/utils"

interface IUploadFileResponse {
  name: string;
  contentType: string;
}

export const postFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await cAxios.post<IUploadFileResponse>(`${BACKEND_URL}/file/upload`, formData, {
    headers: {
      Authorization: `Bearer ${HEADER_TOKEN}`
    }
  })

  return res;
}
