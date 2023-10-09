import { useContext } from 'react';
import { TabProps } from './TabContent';
import { ApplicationDataContext } from '../../../App';
import { applicationDataManager } from '../../../managers/ApplicationDataManager';
import { EditableText } from '../../atoms/EditableText';
import { Accordion, AccordionDetails, AccordionGroup, AccordionSummary, Stack, Typography } from '@mui/joy';
import { EditableTextArea } from '../../atoms/EditableTextArea';
import Table from '@mui/joy/Table';
import { Service } from '../../../types/application-data/application-data';
import { camelCaseToTitle } from '../../../utils/string';
export function ServiceTab(props: TabProps) {
	const data = useContext(ApplicationDataContext);
	const serviceData = data.services[props.id];
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
				</AccordionGroup>
			</Stack>
		</div>
	);
}
