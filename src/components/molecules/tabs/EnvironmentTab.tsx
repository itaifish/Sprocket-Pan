import { useContext } from 'react';
import { applicationDataManager } from '../../../managers/ApplicationDataManager';
import { EditableText } from '../../atoms/EditableText';
import Checkbox from '@mui/joy/Checkbox';
import { TabProps } from './tab-props';
import { ApplicationDataContext } from '../../../managers/GlobalContextManager';
import { EnvironmentEditableTable } from '../editing/EnvironmentEditableTable';
import { Environment } from '../../../types/application-data/application-data';
import { Box } from '@mui/joy';

export function EnvironmentTab(props: TabProps) {
	const data = useContext(ApplicationDataContext);
	const environment = data.environments[props.id];
	return (
		<>
			<EditableText
				text={environment.__name}
				setText={(newText: string) => applicationDataManager.update('environment', props.id, { __name: newText })}
				isValidFunc={(text: string) =>
					text.length >= 1 &&
					Object.values(data.environments)
						.filter((env) => env.__id != props.id)
						.filter((env) => env.__name === text).length === 0
				}
				isTitle
			/>
			<Checkbox
				label="Selected"
				checked={data.selectedEnvironment === props.id}
				onChange={() => {
					if (data.selectedEnvironment === props.id) {
						applicationDataManager.setSelectedEnvironment(undefined);
					} else {
						applicationDataManager.setSelectedEnvironment(props.id);
					}
				}}
			/>
			<Box sx={{ height: '70vh', pb: '5vh' }}>
				<EnvironmentEditableTable
					environment={environment}
					setNewEnvironment={(newEnvironment: Environment) => {
						applicationDataManager.setEnvironment(props.id, {
							...newEnvironment,
							__name: environment.__name,
							__id: environment.__id,
						} as Environment);
					}}
					fullSize={true}
				/>
			</Box>
		</>
	);
}
