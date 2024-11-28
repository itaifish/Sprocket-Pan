import { useEffect, useState } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import { Environment, QueryParams } from '../../../types/application-data/application-data';
import { EditableData, TableData } from './EditableData';
import { UniqueKeyValuePairUtils } from '../../../utils/data-utils';

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
		const data = UniqueKeyValuePairUtils.toTableData(localDataState ?? []);
		setDisplayData(data);
	}, [localDataState]);

	const setTableData = (newData: TableData<number>) => {
		const newQueryParams = UniqueKeyValuePairUtils.fromTableData(newData);
		setLocalDataState(newQueryParams);
	};
	return (
		<EditableData
			tableData={displayData}
			setTableData={setTableData}
			environment={props.varsEnv}
			unique={false}
			fullSize={props.fullSize}
		/>
	);
}
