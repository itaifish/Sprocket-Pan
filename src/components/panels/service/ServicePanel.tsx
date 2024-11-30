import { Accordion, AccordionDetails, AccordionGroup, AccordionSummary, Stack } from '@mui/joy';

import { useSelector } from 'react-redux';
import { selectServices } from '../../../state/active/selectors';
import { updateService } from '../../../state/active/slice';
import { useAppDispatch } from '../../../state/store';
import { Service } from '../../../types/application-data/application-data';
import { EditableText } from '../../shared/input/EditableText';
import { EditableTextArea } from '../../shared/input/EditableTextArea';
import { PanelProps } from '../panels.interface';
import { PrePostScriptDisplay } from '../shared/PrePostScriptDisplay';
import { InformationSection } from './InformationSection';
import { EnvironmentsSection } from './EnvironmentsSection';
import { RecentRequestsSection } from './RecentRequestsSection';

export function ServicePanel({ id }: PanelProps) {
	const dispatch = useAppDispatch();
	const services = useSelector(selectServices);
	const serviceData = services[id];

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
							<InformationSection data={serviceData} onChange={update} />
						</AccordionDetails>
					</Accordion>
					<Accordion defaultExpanded={true}>
						<AccordionSummary>Environments</AccordionSummary>
						<AccordionDetails>
							<EnvironmentsSection data={serviceData} onChange={update} />
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
							<RecentRequestsSection data={serviceData} />
						</AccordionDetails>
					</Accordion>
				</AccordionGroup>
			</Stack>
		</div>
	);
}
