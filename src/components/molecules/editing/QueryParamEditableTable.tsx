import { EditableTable } from './EditableTable';

interface QueryParamEditableTableProps {
	queryParams: Record<string, string[]>;
	setNewQueryParams: (queryParams: Record<string, string[]>) => void;
}

export function QueryParamEditableTable(props: QueryParamEditableTableProps) {
	const data = Object.keys(props.queryParams).flatMap((queryKey) => {
		return props.queryParams[queryKey].map((queryValue, index) => {
			return {
				id: `${queryKey}_${index}`,
				value: queryValue,
				key: queryKey,
			};
		});
	});
	const changeData = (id: string, newKey?: string, newValue?: string) => {
		const [queryKey, arrayIndex] = id.split('_');
		if (newKey != undefined) {
			const updateVal = newValue ?? props.queryParams[queryKey][+arrayIndex];
			props.queryParams[queryKey].splice(+arrayIndex, 1);
			if (newKey !== '') {
				props.queryParams[newKey]?.push(updateVal) ?? (props.queryParams[newKey] = [updateVal]);
			}
		} else {
			if (!newValue) {
				props.queryParams[queryKey].splice(+arrayIndex, 1);
				if (props.queryParams[queryKey].length === 0) {
					delete props.queryParams[queryKey];
				}
			} else {
				props.queryParams[queryKey][+arrayIndex] = newValue as string;
			}
		}
		props.setNewQueryParams(props.queryParams);
	};
	const addNewData = (key: string, value: string) => {
		props.queryParams[key]?.push(value) ?? (props.queryParams[key] = [value]);
		props.setNewQueryParams(props.queryParams);
	};
	return <EditableTable tableData={data} changeTableData={changeData} addNewData={addNewData} />;
}
