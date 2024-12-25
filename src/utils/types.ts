export type Interrupt = (comment?: string) => void;

export interface InterruptableScriptReturn<T> {
	result: Promise<T>;
	interrupt: Interrupt;
}
