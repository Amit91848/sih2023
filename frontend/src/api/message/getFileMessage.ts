import { BACKEND_URL, HEADER_TOKEN, cAxios } from "@/lib/utils"
import { IMessage } from "@/types/message"

export interface GetFileMessagesAll {
    nextCursor: number;
    messages: IMessage[]
}

export const getFileMessage = async  (file_id: number, limit: number, nextCursor: number | undefined = undefined) => {
    const apiUrl = `${BACKEND_URL}/message/all?limit=${limit}&file_id=${file_id}`;
    const urlWithCursor = nextCursor ? `${apiUrl}&cursor=${nextCursor}` : apiUrl;


    const res = await cAxios.get<GetFileMessagesAll>(urlWithCursor, {
        headers: {
            Authorization: `Bearer ${HEADER_TOKEN}`
        }
    })

    return res
}