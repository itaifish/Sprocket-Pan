import { useSelector } from 'react-redux';
import { selectServices } from '../../../state/active/selectors';
import { updateService } from '../../../state/active/slice';
import { useAppDispatch } from '../../../state/store';
import { Service } from '../../../types/application-data/application-data';
import { EditableText } from '../../shared/input/EditableText';
import { PanelProps } from '../panels.interface';
import { PrePostScriptDisplay } from '../shared/PrePostScriptDisplay';
import { EnvironmentsSection } from './EnvironmentsSection';
import { SprocketTabs } from '../../shared/SprocketTabs';
import { AccordionGroup } from '@mui/joy';
import { GeneralSection } from './GeneralSection';

export function ServicePanel({ id }: PanelProps) {
	const dispatch = useAppDispatch();
	const services = useSelector(selectServices);
	const serviceData = services[id];

	function update(values: Partial<Service>) {
		dispatch(updateService({ ...values, id }));
	}

	return (
		<>
			<EditableText
				sx={{ margin: 'auto' }}
				text={serviceData.name}
				setText={(newText: string) => update({ name: newText })}
				isValidFunc={(text: string) => text.length >= 1}
				level="h2"
			/>
			<SprocketTabs
				tabs={[
					{
						title: 'General',
						content: <GeneralSection data={serviceData} onChange={update} />,
					},
					{
						title: 'Environments',
						content: <EnvironmentsSection data={serviceData} onChange={update} />,
					},
					{
						title: 'Scripts',
						content: (
							<AccordionGroup transition="0.2s ease">
								<PrePostScriptDisplay
									onChange={update}
									preRequestScript={serviceData.preRequestScript}
									postRequestScript={serviceData.postRequestScript}
								/>
							</AccordionGroup>
						),
					},
				]}
			/>
		</>
	);
}
