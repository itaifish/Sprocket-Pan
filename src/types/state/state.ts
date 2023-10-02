export type SelectedRequest = {
	service: string;
	endpoint: string;
	request: string;
};

export type StateContext<TData, TDataName extends string> = Record<TDataName, TData> &
	Record<`set${Capitalize<TDataName>}`, React.Dispatch<React.SetStateAction<TData>>>;
