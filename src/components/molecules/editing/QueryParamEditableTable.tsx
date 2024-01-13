import { useEffect, useState } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import { Environment, QueryParams } from '../../../types/application-data/application-data';
import { EditableTable } from './EditableTable';
import { log } from '../../../utils/logging';

type TwoNumbersInStr = `${number}_${number}`;

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
			id: TwoNumbersInStr;
		}[]
	>([]);
	useEffect(() => {
		const data = localDataState.__data.flatMap(({ key, value }, index) =>
			value.map((item, innerIndex) => ({
				id: `${index}_${innerIndex}` as const,
				key: key,
				value: item,
			})),
		);

		setDisplayData(data);
		log.info(JSON.stringify(localDataState));
	}, [localDataState]);

	const changeData = (id: TwoNumbersInStr, newKey?: string, newValue?: string, recurse = true) => {
		const newQueryParams = structuredClone(localDataState);
		const [dataId, arrayIndex] = id.split('_');
		const queryItem = newQueryParams.__data[+dataId];
		if (newKey != undefined) {
			const updateVal = newValue ?? queryItem.value[+arrayIndex];
			queryItem.value.splice(+arrayIndex, 1);
			if (queryItem.value.length === 0) {
				newQueryParams.__data.splice(+dataId, 1);
			}
			delete newQueryParams[queryItem.key];
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
			const dataEl = newQueryParams.__data[+dataId];
			const queryKey = dataEl.key;
			if (!newValue) {
				dataEl.value.splice(+arrayIndex, 1);
				const dataToDelete = newQueryParams[queryKey];
				dataToDelete?.splice(+arrayIndex, 1);
				if (newQueryParams[queryKey].length === 0) {
					delete newQueryParams[queryKey];
					newQueryParams.__data = newQueryParams.__data.filter((x) => x.key !== queryKey);
				}
			} else {
				newQueryParams[queryKey][+arrayIndex] = newValue;
				const dataEl = newQueryParams.__data.find((x) => x.key === newKey);
				if (dataEl) {
					dataEl.value.push(newValue);
				} else {
					newQueryParams.__data.push({ key: queryKey, value: [newValue] });
				}
			}
		}
		if (recurse) {
			// delete everything with an empty value that isnt the current key being edited
			const toDelete = newQueryParams.__data
				.flatMap((x, index) =>
					x.value.map((value, innerIndex) => ({
						key: x.key,
						value,
						id: `${index}_${innerIndex}` as const,
					})),
				)
				.filter((x) => x.value === '' && x.key != newKey);
			toDelete.forEach((delEl) => changeData(delEl.id, undefined, undefined, false));
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
