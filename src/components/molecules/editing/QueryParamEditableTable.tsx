import { useEffect, useState } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import { Environment, QueryParams } from '../../../types/application-data/application-data';
import { EditableTable } from './EditableTable';

interface QueryParamEditableTableProps {
	queryParams: QueryParams;
	setNewQueryParams: (queryParams: QueryParams) => void;
	varsEnv: Environment;
}

export function QueryParamEditableTable(props: QueryParamEditableTableProps) {
	const { localDataState, setLocalDataState } = useDebounce<QueryParams>({
		state: props.queryParams,
		setState: (newState: QueryParams) => props.setNewQueryParams(newState),
	});
	const [displayData, setDisplayData] = useState<
		{
			key: string;
			value: string;
			id: string;
		}[]
	>([]);
	useEffect(() => {
		const data = Object.keys(localDataState).flatMap((queryKey) => {
			if (queryKey.startsWith('__')) {
				return [];
			}
			return localDataState[queryKey].map((queryValue, index) => {
				return {
					id: `${queryKey}_${index}`,
					value: queryValue,
					key: queryKey,
				};
			});
		});
		setDisplayData(data);
	}, [localDataState]);

	const changeData = (id: string, newKey?: string, newValue?: string) => {
		const newQueryParams = structuredClone(localDataState);
		const [queryKey, arrayIndex] = id.split('_');
		if (newKey != undefined) {
			const updateVal = newValue ?? newQueryParams[queryKey][+arrayIndex];
			newQueryParams[queryKey].splice(+arrayIndex, 1);
			if (newKey !== '') {
				newQueryParams[newKey]?.push(updateVal) ?? (newQueryParams[newKey] = [updateVal]);
				const dataEl = newQueryParams.__data.find((x) => x.key === newKey);
				if (dataEl) {
					dataEl.value.push(updateVal);
				} else {
					newQueryParams.__data.push({ key: newKey, value: [updateVal] });
				}
			}
		} else {
			if (!newValue) {
				newQueryParams[queryKey].splice(+arrayIndex, 1);
				const dataEl = newQueryParams.__data.find((x) => x.key === queryKey);
				dataEl?.value.splice(+arrayIndex, 1);
				if (newQueryParams[queryKey].length === 0) {
					delete newQueryParams[queryKey];
					newQueryParams.__data = newQueryParams.__data.filter((x) => x.key !== queryKey);
				}
			} else {
				newQueryParams[queryKey][+arrayIndex] = newValue;
			}
		}
		setLocalDataState(newQueryParams);
	};

	const addNewData = (key: string, value: string) => {
		const newQueryParams = structuredClone(localDataState);
		newQueryParams[key]?.push(value) ?? (newQueryParams[key] = [value]);
		newQueryParams.__data.push({ key, value: [value] });
		setLocalDataState(newQueryParams);
	};
	return (
		<EditableTable
			tableData={displayData}
			changeTableData={changeData}
			addNewData={addNewData}
			environment={props.varsEnv}
		/>
	);
}
