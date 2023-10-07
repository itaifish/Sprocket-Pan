import { useContext } from 'react';
import { ApplicationDataContext } from '../../../App';
import { applicationDataManager } from '../../../managers/ApplicationDataManager';
import { EditableTitle } from '../../atoms/EditableTitle';
import { TabProps } from './TabContent';
import { Table } from '@mui/joy';

export function EnvironmentTab(props: TabProps) {
	const data = useContext(ApplicationDataContext);
	const environment = data.environments[props.id];
	return (
		<>
			<EditableTitle
				titleText={environment.__name}
				setTitleText={(newText: string) => applicationDataManager.update('environment', props.id, { __name: newText })}
				isValidFunc={(text: string) =>
					text.length >= 1 &&
					Object.values(data.environments)
						.filter((env) => env.__id != props.id)
						.filter((env) => env.__name === text).length === 0
				}
			/>
			<Table stripe={'even'} variant="outlined" size="lg" sx={{ marginTop: '20px' }}>
				<thead>
					<tr>
						<th>Key</th>
						<th>Value</th>
					</tr>
				</thead>
				<tbody>
					{Object.keys(environment)
						.filter((key) => !key.startsWith('__'))
						.sort()
						.map((key, index) => (
							<tr key={index}>
								<td>{key}</td>
								<td>{environment[key]}</td>
							</tr>
						))}
					<tr>
						<td></td>
						<td></td>
					</tr>
				</tbody>
			</Table>
		</>
	);
}
