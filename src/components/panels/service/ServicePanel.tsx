import { useSelector } from 'react-redux';
import { PanelProps } from '../panels.interface';
import { PrePostScriptDisplay } from '../shared/PrePostScriptDisplay';
import { EnvironmentsSection } from './EnvironmentsSection';
import { AccordionGroup } from '@mui/joy';
import { GeneralSection } from './GeneralSection';
import { SprocketTabs } from '@/components/shared/SprocketTabs';
import { selectServices } from '@/state/active/selectors';
import { activeActions } from '@/state/active/slice';
import { useAppDispatch } from '@/state/store';
import { Service } from '@/types/data/workspace';
import { EditableHeader } from '../shared/EditableHeader';
import { SyncButton } from '@/components/shared/buttons/SyncButton';

export function ServicePanel({ id }: PanelProps) {
	const dispatch = useAppDispatch();
	const services = useSelector(selectServices);
	const serviceData = services[id];

	function update(values: Partial<Service>) {
		dispatch(activeActions.updateService({ ...values, id }));
	}

	return (
		<>
			<EditableHeader value={serviceData.name} onChange={(name) => update({ name })} right={<SyncButton id={id} />} />
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
