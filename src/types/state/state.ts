export type StateContext<TData, TDataName extends string> = Record<TDataName, TData> &
	Record<`set${Capitalize<TDataName>}`, React.Dispatch<React.SetStateAction<TData>>>;

export type TabTypeWithData = 'environment' | 'service' | 'endpoint' | 'request' | 'script';
export type TabType = TabTypeWithData | 'secrets';

export type SprocketError = {
	errorType: string;
	errorStr: string;
};
