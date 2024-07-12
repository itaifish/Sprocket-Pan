import { useEffect, useState } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import { Environment, QueryParams } from '../../../types/application-data/application-data';
import { EditableData, TableData } from './EditableData';
import { QueryParamUtils } from '../../../utils/data-utils';

interface QueryParamEditableTableProps {
	queryParams: QueryParams;
	setNewQueryParams: (queryParams: QueryParams) => void;
	varsEnv: Environment;
	fullSize?: boolean;
}

export function QueryParamEditableTable(props: QueryParamEditableTableProps) {
	const { localDataState, setLocalDataState } = useDebounce<QueryParams>({
		state: props.queryParams,
		setState: (newState: QueryParams) => props.setNewQueryParams(newState),
	});
	const [displayData, setDisplayData] = useState<TableData<number>>([]);
	useEffect(() => {
		const data = QueryParamUtils.toTableData<QueryParams>(localDataState);
		setDisplayData(data);
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

	const setTableData = (newData: TableData<number>) => {
		const newQueryParams = QueryParamUtils.fromTableData(newData);
		setLocalDataState(newQueryParams);
	};
	return (
		<EditableData
			tableData={displayData}
			changeTableData={changeData}
			addNewData={addNewData}
			setTableData={setTableData}
			environment={props.varsEnv}
			unique={false}
			fullSize={props.fullSize}
		/>
	);
}
