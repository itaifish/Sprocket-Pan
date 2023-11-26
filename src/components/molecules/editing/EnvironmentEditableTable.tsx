import { Environment } from '../../../types/application-data/application-data';
import { EditableTable } from './EditableTable';

interface EnvironmentEditableTableProps {
	environment: Environment;
	setNewEnvironment: (newEnvironment: Environment) => void;
	varsEnv?: Environment;
}

export function EnvironmentEditableTable(props: EnvironmentEditableTableProps) {
	const envKeys = Object.keys(props.environment).filter((envKey) => !envKey.startsWith('__'));
	const data = envKeys.map((envKey) => {
		return {
			id: envKey,
			value: props.environment[envKey],
			key: envKey,
		};
	});
	const changeData = (id: string, newKey?: string, newValue?: string) => {
		const newEnv = { ...props.environment };
		if (newKey != undefined) {
			const updateVal = newValue ?? props.environment[id];
			delete newEnv[id];
			if (newKey !== '') {
				newEnv[newKey] = updateVal;
			}
		} else {
			newEnv[id] = newValue ?? '';
		}
		props.setNewEnvironment(newEnv);
	};
	const addNewData = (key: string, value: string) => changeData(key, key, value);
	return (
		<EditableTable tableData={data} changeTableData={changeData} addNewData={addNewData} environment={props.varsEnv} />
	);
}
