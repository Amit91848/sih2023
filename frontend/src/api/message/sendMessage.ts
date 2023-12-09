import { BACKEND_URL, HEADER_TOKEN, cAxios } from "@/lib/utils"

interface ISendMessage {
    message: string;
    fileId: number;
}

export const sendMessage = async ({ fileId, message }: ISendMessage) => {
    const res = await cAxios.post(`${BACKEND_URL}/message`, { fileId, message }, {
        headers: {
            Authorization: `Bearer ${HEADER_TOKEN}`
        }
    })

    return res;
}