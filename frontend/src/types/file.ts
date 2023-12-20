export enum Status {
	PENDING = "PENDING",
	PROCESSING = "PROCESSING",
	SUCCESS = "SUCCESS",
	FAILED = "FAILED",
}

export interface IFile {
	name: string;
	url: string;
	updated_at: Date;
	user_id: number;
	key: string;
	created_at: Date;
	id: number;
	isLocal: boolean;
	summary_status?: Status;
	size: number;
	isPdf: boolean;
	ocrText?: string;
	ocrOgImage?: string;
}
