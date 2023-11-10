import { useContext } from 'react';
import { applicationDataManager } from '../../../managers/ApplicationDataManager';
import { EditableText } from '../../atoms/EditableText';
import { IconButton, Table } from '@mui/joy';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import Checkbox from '@mui/joy/Checkbox';
import { TabProps } from './tab-props';
import { ApplicationDataContext } from '../../../managers/GlobalContextManager';

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
								<td>
									<EditableText
										isTitle={false}
										text={key}
										setText={(newText) => {
											applicationDataManager.update('environment', props.id, {
												[key]: undefined,
												[newText]: environment[key],
											});
										}}
										isValidFunc={(text) =>
											text.length >= 1 &&
											!text.startsWith('__') &&
											!Object.keys(environment)
												.filter((x) => x != key)
												.includes(text)
										}
									/>
								</td>
								<td>
									<EditableText
										isTitle={false}
										text={environment[key]}
										setText={(newText) => {
											applicationDataManager.update('environment', props.id, {
												[key]: newText,
											});
										}}
										isValidFunc={(_text) => true}
									/>
								</td>
							</tr>
						))}
					<tr>
						<td>
							<IconButton
								onClick={() => {
									let newVariable = `New Variable`;
									const keys = Object.keys(environment);
									let index = 0;
									while (keys.includes(`${newVariable}${index === 0 ? '' : ` (${index})`}`)) {
										index++;
									}
									newVariable = `${newVariable}${index === 0 ? '' : ` (${index})`}`;
									applicationDataManager.update('environment', props.id, {
										[newVariable]: '?',
									});
								}}
							>
								<LibraryAddIcon />
							</IconButton>
						</td>
						<td></td>
					</tr>
				</tbody>
			</Table>
		</>
	);
}
