import { useEffect, useState } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import { Environment, QueryParams } from '../../../types/application-data/application-data';
import { EditableTable } from './EditableTable';
import { log } from '../../../utils/logging';
import { QueryParamUtils } from '../../../utils/data-utils';

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
		const data = Object.entries(localDataState)
			.map((x) => ({ key: x[0], value: x[1] as string[] }))
			.filter((x) => !x.key.startsWith('__'))
			.flatMap(({ key, value }, index) =>
				value.map((item, innerIndex) => ({
					id: `${index}_${innerIndex}` as const,
					key: key,
					value: item,
				})),
			);

		setDisplayData(data);
		log.info(JSON.stringify(localDataState));
	}, [localDataState]);

	const changeData = (id: TwoNumbersInStr, newKey?: string, newValue?: string) => {
		const newQueryParams = structuredClone(localDataState);
		const [dataId, arrayIndex] = id.split('_').map((x) => +x);
		if (newKey != undefined) {
			if (newKey === '') {
				QueryParamUtils.deleteKeyValuePair(newQueryParams, dataId, arrayIndex);
			} else {
				QueryParamUtils.updateKey(newQueryParams, dataId, newKey, arrayIndex);
			}
		} else {
			if (!newValue) {
				QueryParamUtils.deleteKeyValuePair(newQueryParams, dataId, arrayIndex);
			} else {
				QueryParamUtils.updateValue(newQueryParams, dataId, newValue);
			}
		}
		setLocalDataState(newQueryParams);
	};

	const addNewData = (key: string, value: string) => {
		const newQueryParams = structuredClone(localDataState);
		QueryParamUtils.add(newQueryParams, key, value);
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
