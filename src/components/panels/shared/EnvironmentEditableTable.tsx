import { useEffect, useState } from 'react';
import { Environment } from '../../../types/application-data/application-data';
import { useDebounce } from '../../../hooks/useDebounce';
import { EnvironmentUtils } from '../../../utils/data-utils';
import { log } from '../../../utils/logging';
import { EditableData, TableData } from '../../shared/input/EditableData';

interface EnvironmentEditableTableProps {
	environment: Environment;
	setNewEnvironment: (newEnvironment: Environment) => void;
	varsEnv?: Environment;
	fullSize?: boolean;
}

export function EnvironmentEditableTable(props: EnvironmentEditableTableProps) {
	const { localDataState, setLocalDataState } = useDebounce<Environment>({
		state: props.environment,
		setState: (newState: Environment) => props.setNewEnvironment(newState),
	});
	const [displayData, setDisplayData] = useState<TableData<number>>([]);

	useEffect(() => {
		setDisplayData(
			(localDataState.__data ?? []).map((datum, index) => {
				return {
					id: index,
					value: datum.value,
					key: datum.key,
				};
			}),
		);
	}, [localDataState]);

	const changeData = (id: number, newKey?: string, newValue?: string) => {
		const oldKVP = localDataState.__data[id];
		const newEnv = { ...localDataState, __data: structuredClone(localDataState.__data) } as Environment;
		if (!oldKVP) {
			if (id === -1) {
				newEnv.__data.push({ key: newKey as string, value: newValue as string });
				newEnv[newKey as string] = newValue as string;
			} else {
				return;
			}
		} else if (newKey != undefined) {
			const updateVal = newValue ?? localDataState[id];
			delete newEnv[oldKVP.key];
			if (newKey !== '') {
				newEnv[newKey] = updateVal;
				newEnv.__data[id].key = newKey;
			} else {
				newEnv.__data.splice(id, 1);
			}
		} else {
			newEnv[oldKVP.key] = newValue ?? '';
			newEnv.__data[id].value = newValue ?? '';
		}
		setLocalDataState(newEnv);
	};
	const addNewData = (key: string, value: string) => changeData(-1, key, value);
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
			changeTableData={changeData}
			addNewData={addNewData}
			setTableData={setTableData}
			environment={props.varsEnv}
			unique={true}
			fullSize={props.fullSize}
		/>
	);
}
