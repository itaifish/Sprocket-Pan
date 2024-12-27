export type Interrupt = (comment?: string) => void;

export interface InterruptibleScriptReturn<T> {
	result: Promise<T>;
	interrupt: Interrupt;
}
