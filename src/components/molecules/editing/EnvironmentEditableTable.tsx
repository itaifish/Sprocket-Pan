import { Environment } from '../../../types/application-data/application-data';
import { EditableTable } from './EditableTable';

interface EnvironmentEditableTableProps {
	environment: Environment;
	setNewEnvironment: (newEnvironment: Environment) => void;
	varsEnv?: Environment;
}

export function EnvironmentEditableTable(props: EnvironmentEditableTableProps) {
	const data = props.environment.__data.map((datum, index) => {
		return {
			id: index,
			value: datum.value,
			key: datum.key,
		};
	});
	const changeData = (id: number, newKey?: string, newValue?: string) => {
		const oldKVP = props.environment.__data[id];
		const newEnv = { ...props.environment, __data: structuredClone(props.environment.__data) } as Environment;
		if (!oldKVP) {
			if (id === -1) {
				newEnv.__data.push({ key: newKey as string, value: newValue as string });
				newEnv[newKey as string] = newValue as string;
			} else {
				return;
			}
		} else if (newKey != undefined) {
			const updateVal = newValue ?? props.environment[id];
			delete newEnv[oldKVP.key];
			if (newKey !== '') {
				newEnv[newKey] = updateVal;
			}
		} else {
			newEnv[oldKVP.key] = newValue ?? '';
		}
		props.setNewEnvironment(newEnv);
	};
	const addNewData = (key: string, value: string) => changeData(-1, key, value);
	return (
		<EditableTable tableData={data} changeTableData={changeData} addNewData={addNewData} environment={props.varsEnv} />
	);
}
