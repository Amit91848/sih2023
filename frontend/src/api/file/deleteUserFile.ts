import { BACKEND_URL, HEADER_TOKEN, cAxios } from "@/lib/utils"

export const deleteUserFile = async ({ file_id }: { file_id: number } ) => {
    const res = await cAxios.delete(`${BACKEND_URL}/file/${file_id}`, {
        headers: {
            Authorization: `Bearer ${HEADER_TOKEN}`
        }
    })

    return res;
}