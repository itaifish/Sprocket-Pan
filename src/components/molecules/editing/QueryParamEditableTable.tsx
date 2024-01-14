import { useEffect, useState } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import { Environment, QueryParams } from '../../../types/application-data/application-data';
import { EditableTable } from './EditableTable';
import { log } from '../../../utils/logging';
import { QueryParamUtils } from '../../../utils/data-utils';

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
			id: number;
		}[]
	>([]);
	useEffect(() => {
		const data = localDataState.__data.map((datum, index) => ({ ...datum, id: index }));
		setDisplayData(data);
		log.info(JSON.stringify(localDataState));
	}, [localDataState]);

	const changeData = (id: number, newKey?: string, newValue?: string) => {
		const newQueryParams = structuredClone(localDataState);
		const dataId = id;
		if (newKey != undefined) {
			if (newKey === '') {
				QueryParamUtils.deleteKeyValuePair(newQueryParams, dataId);
			} else {
				QueryParamUtils.updateKey(newQueryParams, dataId, newKey);
			}
		} else {
			if (!newValue) {
				QueryParamUtils.deleteKeyValuePair(newQueryParams, dataId);
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
