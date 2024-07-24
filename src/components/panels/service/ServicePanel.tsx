import { useMemo, useState } from 'react';
import {
	Accordion,
	AccordionDetails,
	AccordionGroup,
	AccordionSummary,
	Box,
	IconButton,
	List,
	Stack,
	Typography,
} from '@mui/joy';
import Table from '@mui/joy/Table';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { v4 } from 'uuid';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';

import { useSelector } from 'react-redux';
import { environmentContextResolver } from '../../../managers/EnvironmentContextResolver';
import {
	selectEnvironments,
	selectServices,
	selectSelectedEnvironment,
	selectSettings,
	selectRequests,
	selectEndpoints,
} from '../../../state/active/selectors';
import { updateService } from '../../../state/active/slice';
import { useAppDispatch } from '../../../state/store';
import { Service, EndpointRequest, Environment } from '../../../types/application-data/application-data';
import { camelCaseToTitle } from '../../../utils/string';
import { asEnv } from '../../../utils/types';
import { SprocketTooltip } from '../../shared/SprocketTooltip';
import { EditableText } from '../../shared/input/EditableText';
import { EditableTextArea } from '../../shared/input/EditableTextArea';
import { AreYouSureModal } from '../../shared/modals/AreYouSureModal';
import { EnvironmentEditableTable } from '../shared/EnvironmentEditableTable';
import { RecentRequestListItem } from './RecentRequestListItem';
import { PanelProps } from '../panels.interface';
import { PrePostScriptDisplay } from '../shared/PrePostScriptDisplay';
import { log } from '../../../utils/logging';

export function ServicePanel({ id }: PanelProps) {
	const dispatch = useAppDispatch();
	const environments = useSelector(selectEnvironments);
	const services = useSelector(selectServices);
	const selectedEnvironment = useSelector(selectSelectedEnvironment);
	const settings = useSelector(selectSettings);
	const requests = useSelector(selectRequests);
	const endpoints = useSelector(selectEndpoints);
	const serviceData = services[id];
	const [envToDelete, setEnvToDelete] = useState<string | null>(null);
	const serviceDataKeys = ['version', 'baseUrl'] as const satisfies readonly (keyof Service)[];
	const recentRequests = useMemo(() => {
		const allRequests = serviceData.endpointIds.flatMap((endpointId) => {
			const endpoint = endpoints[endpointId];
			if (endpoint != null) {
				return endpoint.requestIds
					.map((requestId) => {
						const request = requests[requestId];
						if (request == null) {
							return null as unknown as EndpointRequest;
						}
						return request;
					})
					.filter((request) => request != null);
			}
			return [];
		});
		return allRequests
			.sort((req1, req2) => {
				if (req1.history.length == 0 && req2.history.length == 0) {
					return req1.name.localeCompare(req2.name);
				}
				if (req1.history.length == 0) {
					return 1;
				}
				if (req2.history.length == 0) {
					return -1;
				}
				const req1MostRecent = req1.history[req1.history.length - 1].request.dateTime;
				const req2MostRecent = req2.history[req2.history.length - 1].request.dateTime;
				const difference = req2MostRecent - req1MostRecent;
				if (difference != 0) {
					return difference;
				}
				return req2.history.length - req1.history.length;
			})
			.slice(0, 20);
	}, [id]);

	function update(values: Partial<Service>) {
		dispatch(updateService({ ...values, id }));
	}

	return (
		<div>
			<Stack direction={'column'}>
				<EditableText
					text={serviceData.name}
					setText={(newText: string) => update({ name: newText })}
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
								setText={(newText: string) => update({ description: newText })}
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
													setText={(newText: string) => update({ [serviceDataKey]: `${newText}` })}
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
											const newEnv = asEnv({
												__id: v4(),
												__name: `${serviceData.name}.env.${Object.keys(serviceData.localEnvironments).length}`,
												__data: [],
											});
											update({
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
													update({
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
														update({
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
													update({
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
													update({
														localEnvironments: {
															...structuredClone(serviceData.localEnvironments),
															[env.__id]: { ...newEnv, __name: env.__name, __id: env.__id } as Environment,
														},
													})
												}
												varsEnv={environmentContextResolver.buildEnvironmentVariables(
													{ services, selectedEnvironment, environments, requests, settings },
													serviceData.id,
												)}
											/>
										</Box>
									))}
								</Stack>
							</Box>
						</AccordionDetails>
					</Accordion>
					<PrePostScriptDisplay
						onChange={update}
						preRequestScript={serviceData.preRequestScript}
						postRequestScript={serviceData.postRequestScript}
					/>
					<Accordion defaultExpanded>
						<AccordionSummary>Recent Requests</AccordionSummary>
						<AccordionDetails>
							<List>
								{recentRequests.map((request, index) => (
									<Box key={index}>
										<RecentRequestListItem request={request} />
									</Box>
								))}
							</List>
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
						const newData = structuredClone(serviceData.localEnvironments);
						log.info(`Before: ${JSON.stringify(newData[envToDelete])}`);
						delete newData[envToDelete];
						log.info(`After: ${JSON.stringify(newData[envToDelete])}`);
						update({
							localEnvironments: newData,
						});
					}
				}}
			></AreYouSureModal>
		</div>
	);
}
