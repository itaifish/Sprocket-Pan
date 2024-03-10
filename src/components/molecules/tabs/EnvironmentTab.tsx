import { applicationDataManager } from '../../../managers/ApplicationDataManager';
import { EditableText } from '../../atoms/EditableText';
import Checkbox from '@mui/joy/Checkbox';
import { TabProps } from './tab-props';
import { EnvironmentEditableTable } from '../editing/EnvironmentEditableTable';
import { Environment } from '../../../types/application-data/application-data';
import { selectEnvironments, selectSelectedEnvironment } from '../../../state/active/selectors';
import { useSelector } from 'react-redux';

export function EnvironmentTab({ id }: TabProps) {
	const selectedEnvironment = useSelector(selectSelectedEnvironment);
	const environments = useSelector(selectEnvironments);
	const environment = environments[id];

	return (
		<>
			<EditableText
				text={environment.__name}
				setText={(newText: string) => applicationDataManager.update('environment', id, { __name: newText })}
				isValidFunc={(text: string) =>
					text.length >= 1 &&
					Object.values(environments)
						.filter((env) => env.__id != id)
						.filter((env) => env.__name === text).length === 0
				}
				isTitle
			/>
			<Checkbox
				label="Selected"
				checked={selectedEnvironment === id}
				onChange={() => {
					if (selectedEnvironment === id) {
						applicationDataManager.setSelectedEnvironment(undefined);
					} else {
						applicationDataManager.setSelectedEnvironment(props.id);
					}
				}}
			/>
			<div style={{ height: '60vh' }}>
				<EnvironmentEditableTable
					environment={environment}
					setNewEnvironment={(newEnvironment: Environment) => {
						applicationDataManager.setEnvironment(id, {
							...newEnvironment,
							__name: environment.__name,
							__id: environment.__id,
						} as Environment);
					}}
					fullSize={true}
				/>
			</div>
		</>
	);
}
