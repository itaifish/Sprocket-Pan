export type StateContext<TData, TDataName extends string> = Record<TDataName, TData> &
	Record<`set${Capitalize<TDataName>}`, React.Dispatch<React.SetStateAction<TData>>>;

export type TabType = 'environment' | 'service' | 'endpoint' | 'request' | 'script';
