import { BACKEND_URL, HEADER_TOKEN, cAxios } from "@/lib/utils"
import { IFile } from "@/types"

export const getFile = async ({ file_id }: { file_id: number }) => {
    const res = await cAxios.get<IFile>(`${BACKEND_URL}/file/${file_id}`, {
        headers: {
            Authorization: `Bearer ${HEADER_TOKEN}`
        }
    })

    return res
}