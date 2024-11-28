import { useEffect, useState } from 'react';
import { Environment } from '../../../types/application-data/application-data';
import { useDebounce } from '../../../hooks/useDebounce';
import { EnvironmentUtils } from '../../../utils/data-utils';
import { log } from '../../../utils/logging';
import { EditableData, TableData } from '../../shared/input/EditableData';

export interface EnvironmentEditableTableSettings {
	varsEnv?: Environment;
	fullSize?: boolean;
}

interface EnvironmentEditableTableProps extends EnvironmentEditableTableSettings {
	environment: Environment;
	setNewEnvironment: (newEnvironment: Environment) => void;
}

export function EnvironmentEditableTable(props: EnvironmentEditableTableProps) {
	const { localDataState, setLocalDataState } = useDebounce<Environment>({
		state: props.environment,
		setState: (newState: Environment) => props.setNewEnvironment(newState),
	});
	const [displayData, setDisplayData] = useState<TableData<number>>([]);

	useEffect(() => {
		setDisplayData(
			(localDataState?.__data ?? []).map((datum, index) => {
				return {
					id: index,
					value: datum.value,
					key: datum.key,
				};
			}),
		);
	}, [localDataState]);

	const setTableData = (newData: TableData<number>) => {
		try {
			const newEnvironment = EnvironmentUtils.fromTableData(newData);
			setLocalDataState(newEnvironment);
		} catch (e) {
			log.error(e);
		}
	};
	return (
		<EditableData
			tableData={displayData}
			setTableData={setTableData}
			environment={props.varsEnv}
			unique={true}
			fullSize={props.fullSize}
		/>
	);
}
