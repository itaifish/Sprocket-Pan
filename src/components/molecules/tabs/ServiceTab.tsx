import { useContext, useState } from 'react';
import { applicationDataManager } from '../../../managers/ApplicationDataManager';
import { EditableText } from '../../atoms/EditableText';
import {
	Accordion,
	AccordionDetails,
	AccordionGroup,
	AccordionSummary,
	Box,
	IconButton,
	Stack,
	Typography,
} from '@mui/joy';
import { EditableTextArea } from '../../atoms/EditableTextArea';
import Table from '@mui/joy/Table';
import { Environment, Service } from '../../../types/application-data/application-data';
import { camelCaseToTitle } from '../../../utils/string';
import { RequestScript } from '../scripts/RequestScript';
import { TabProps } from './tab-props';
import { ApplicationDataContext } from '../../../managers/GlobalContextManager';
import { EnvironmentEditableTable } from '../editing/EnvironmentEditableTable';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { v4 } from 'uuid';
import { SprocketTooltip } from '../../atoms/SprocketTooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import { AreYouSureModal } from '../../atoms/modals/AreYouSureModal';
import { environmentContextResolver } from '../../../managers/EnvironmentContextResolver';

export function ServiceTab(props: TabProps) {
	const data = useContext(ApplicationDataContext);
	const serviceData = data.services[props.id];
	const [envToDelete, setEnvToDelete] = useState<string | null>(null);
	const serviceDataKeys = ['version', 'baseUrl'] as const satisfies readonly (keyof Service)[];

	return (
		<div>
			<Stack direction={'column'}>
				<EditableText
					text={serviceData.name}
					setText={(newText: string) => applicationDataManager.update('service', props.id, { name: newText })}
					isValidFunc={(text: string) => text.length >= 1}
					isTitle
				/>
				<AccordionGroup transition="0.2s ease">
					<Accordion defaultExpanded={true}>
						<AccordionSummary>Description</AccordionSummary>
						<AccordionDetails>
							<EditableTextArea
								label="Description"
								text={serviceData.description}
								setText={(newText: string) =>
									applicationDataManager.update('service', props.id, { description: newText })
								}
								isValidFunc={(text: string) => text.length >= 1}
								renderAsMarkdown={true}
							/>
						</AccordionDetails>
					</Accordion>

					<Accordion defaultExpanded={true}>
						<AccordionSummary>Information</AccordionSummary>
						<AccordionDetails>
							<Table variant="outlined" borderAxis={'bothBetween'} sx={{ maxWidth: '70%', ml: 'auto', mr: 'auto' }}>
								<tbody>
									{serviceDataKeys.map((serviceDataKey, index) => (
										<tr key={index}>
											<td>
												<Typography level="body-md">{camelCaseToTitle(serviceDataKey)}</Typography>
											</td>
											<td>
												<EditableText
													text={serviceData[serviceDataKey]}
													setText={(newText: string) =>
														applicationDataManager.update('service', props.id, { [serviceDataKey]: `${newText}` })
													}
													isValidFunc={(text: string) => text.length >= 1}
												/>
											</td>
										</tr>
									))}
								</tbody>
							</Table>
						</AccordionDetails>
					</Accordion>
					<Accordion defaultExpanded={true}>
						<AccordionSummary>Environments</AccordionSummary>
						<AccordionDetails>
							<Box>
								<SprocketTooltip text="Add New Service Environment">
									<IconButton
										onClick={() => {
											const newEnv = {
												__id: v4(),
												__name: `${serviceData.name}.env.${Object.keys(serviceData.localEnvironments).length}`,
												__data: [],
											} as unknown as Environment;
											applicationDataManager.update('service', serviceData.id, {
												localEnvironments: { ...serviceData.localEnvironments, [newEnv.__id]: newEnv },
											});
										}}
									>
										<PlaylistAddIcon />
									</IconButton>
								</SprocketTooltip>
								<Stack spacing={4}>
									{Object.values(serviceData.localEnvironments).map((env) => (
										<Box key={env.__id}>
											<EditableText
												text={env.__name}
												setText={(text) =>
													applicationDataManager.update('service', serviceData.id, {
														localEnvironments: {
															...serviceData.localEnvironments,
															[env.__id]: { ...env, __name: text } as Environment,
														},
													})
												}
												isValidFunc={function (text: string): boolean {
													return text != '';
												}}
												isTitle
												color={serviceData.selectedEnvironment === env.__id ? 'primary' : 'neutral'}
											></EditableText>
											<SprocketTooltip text={serviceData.selectedEnvironment === env.__id ? 'Unselect' : 'Select'}>
												<IconButton
													onClick={() => {
														applicationDataManager.update('service', serviceData.id, {
															selectedEnvironment: serviceData.selectedEnvironment === env.__id ? undefined : env.__id,
														});
													}}
												>
													{serviceData.selectedEnvironment === env.__id ? (
														<RadioButtonCheckedIcon />
													) : (
														<RadioButtonUncheckedIcon />
													)}
												</IconButton>
											</SprocketTooltip>
											<SprocketTooltip
												text="Duplicate"
												onClick={() => {
													const newEnv = structuredClone(env);
													newEnv.__id = v4();
													newEnv.__name += ' (Copy)';
													applicationDataManager.update('service', serviceData.id, {
														localEnvironments: { ...serviceData.localEnvironments, [newEnv.__id]: newEnv },
													});
												}}
											>
												<IconButton>
													<FileCopyIcon />
												</IconButton>
											</SprocketTooltip>
											<SprocketTooltip
												text="Delete"
												onClick={() => {
													setEnvToDelete(env.__id);
												}}
											>
												<IconButton>
													<DeleteIcon />
												</IconButton>
											</SprocketTooltip>

											<EnvironmentEditableTable
												environment={env}
												setNewEnvironment={(newEnv) =>
													applicationDataManager.update('service', serviceData.id, {
														localEnvironments: {
															...serviceData.localEnvironments,
															[env.__id]: { ...newEnv, __name: env.__name, __id: env.__id } as Environment,
														},
													})
												}
												varsEnv={environmentContextResolver.buildEnvironmentVariables(data, serviceData.id)}
											/>
										</Box>
									))}
								</Stack>
							</Box>
						</AccordionDetails>
					</Accordion>
					<Accordion defaultExpanded>
						<AccordionSummary>Pre-Request Script</AccordionSummary>
						<AccordionDetails>
							<RequestScript
								scriptText={serviceData.preRequestScript}
								scriptKey={'preRequestScript'}
								updateScript={(scriptText: string) => {
									applicationDataManager.update('service', serviceData.id, { preRequestScript: scriptText });
								}}
							/>
						</AccordionDetails>
					</Accordion>
					<Accordion defaultExpanded>
						<AccordionSummary>Post-Request Script</AccordionSummary>
						<AccordionDetails>
							<RequestScript
								scriptText={serviceData.postRequestScript}
								scriptKey={'postRequestScript'}
								updateScript={(scriptText: string) => {
									applicationDataManager.update('service', serviceData.id, { postRequestScript: scriptText });
								}}
							/>
						</AccordionDetails>
					</Accordion>
				</AccordionGroup>
			</Stack>
			<AreYouSureModal
				open={!!envToDelete}
				closeFunc={() => setEnvToDelete(null)}
				action={`delete ${serviceData.localEnvironments[envToDelete ?? '']?.__name ?? envToDelete}`}
				actionFunc={() => {
					if (envToDelete) {
						delete serviceData.localEnvironments[envToDelete];
						applicationDataManager.update('service', serviceData.id, {
							localEnvironments: { ...serviceData.localEnvironments },
						});
					}
				}}
			></AreYouSureModal>
		</div>
	);
}
