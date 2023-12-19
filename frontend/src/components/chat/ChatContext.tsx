import React, { ReactNode, createContext, useRef, useState } from "react";
// import { useToast } from "../ui/use-toast";
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessageText } from "@/api/message/sendMessage";
import { GetFileMessagesAll } from "@/api/message/getFileMessage";
import { APIResponse } from "@/lib/utils";
import { IMessage } from "@/types/message";
// import { useMutation } from "@tanstack/react-query";
// import { trpc } from "@/app/_trpc/client";
// import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";

type StreamResponse = {
	addMessage: () => void;
	message: string;
	handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
	isLoading: boolean;
};

export const ChatContext = createContext<StreamResponse>({
	addMessage: () => {},
	message: "",
	handleInputChange: () => {},
	isLoading: false,
});

interface Props {
	fileId: string;
	children: ReactNode;
}

export const ChatContextProvider = ({ fileId, children }: Props) => {
	const [message, setMessage] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const queryClient = useQueryClient();

	// const { toast } = useToast();

	const backupMessage = useRef("");

	const { mutate: sendMessage } = useMutation({
		mutationFn: sendMessageText,
		onMutate: async ({ message }) => {
			backupMessage.current = message;
			setMessage("");

			const previousMessages = queryClient.getQueryData<
				InfiniteData<APIResponse<GetFileMessagesAll>> | undefined
			>(["file_id", fileId, "messages"]);

			console.log(previousMessages);

			queryClient.setQueryData<
				InfiniteData<APIResponse<GetFileMessagesAll>> | undefined
			>(["file_id", fileId, "messages"], (old) => {
				if (!old) return undefined;

				let newPages = [...old.pages];

				let latestPage = newPages[0];

				const newMessage: IMessage = {
					created_at: new Date(),
					id: Math.floor(Math.random() * 10000),
					text: message,
					isUserMessage: true,
					file_id: parseInt(fileId),
					updated_at: new Date(),
					user_id: Math.floor(Math.random() * 10000),
				};

				if (latestPage.data) {
					latestPage.data.messages = [newMessage, ...latestPage.data.messages];
				}

				newPages[0] = latestPage;

				return {
					...old,
					pages: newPages,
				};
			});

			setIsLoading(true);

			return {
				previousMessages:
					previousMessages?.pages.flatMap((page) => page.data?.messages) ?? [],
			};
		},
		onSettled: () => {
			console.log(queryClient.getQueryData(["file_id", fileId, "messages"]));
			queryClient.invalidateQueries(["file_id", fileId, "messages"]);
			setIsLoading(false);
		},
		onSuccess: async (res) => {
			console.log("Success");
			const reader = res?.getReader();
			const decoder = new TextDecoder();
			let done = false;

			while (!done) {
				const { value, done: doneReading } = await reader.read();
				done = doneReading;
				const chunkValue = decoder.decode(value);

				queryClient.setQueryData<
					InfiniteData<APIResponse<GetFileMessagesAll>> | undefined
				>(["file_id", fileId, "messages"], (old) => {
					if (!old) return { pages: [], pageParams: [] };

					let isAiResponseCreated = old.pages.some(
						(page) =>
							// page.messages.some((message) => message.id === "ai-response")
							page.data?.messages.some((message) => message.id === 0),
					);

					let updatedPages = old.pages.map((page) => {
						if (page === old.pages[0]) {
							let updatedMessages;

							if (!isAiResponseCreated) {
								updatedMessages = [
									{
										createdAt: new Date().toISOString(),
										id: 0,
										text: chunkValue,
										isUserMessage: false,
									},
									...page.data?.messages,
								];
								// console.log("if condition: ");
								// console.log(updatedMessages);
							} else {
								updatedMessages = page.data?.messages.map((message) => {
									if (message.id === 0) {
										return {
											...message,
											text: message.text + chunkValue,
										};
									}
									return message;
								});
								console.log("else condition: ");
							}
							if (page.data) {
								page.data.messages = updatedMessages;
							}
							console.log(page);
							return { ...page };
						}
						return page;
					});

					return { ...old, pages: updatedPages };
				});
			}
		},
	});
	//   onError: (_, __, context) => {
	//     setMessage(backupMessage.current);
	//     utils.getFileMessages.setData(
	//       { fileId },
	//       { messages: context?.previousMessages ?? [] }
	//     );
	//   },

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setMessage(e.target.value);
	};

	const addMessage = () => sendMessage({ message, fileId: parseInt(fileId) });

	return (
		<ChatContext.Provider
			value={{
				addMessage,
				message,
				handleInputChange,
				isLoading,
			}}
		>
			{children}
		</ChatContext.Provider>
	);
};
