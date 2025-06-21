import { useSelector } from 'react-redux';
import { PanelProps } from '../panels.interface';
import { PrePostScriptDisplay } from '../shared/PrePostScriptDisplay';
import { EnvironmentsSection } from './EnvironmentsSection';
import { AccordionGroup, Stack } from '@mui/joy';
import { GeneralSection } from './GeneralSection';
import { SprocketTabs } from '@/components/shared/SprocketTabs';
import { activeActions } from '@/state/active/slice';
import { useAppDispatch } from '@/state/store';
import { Service } from '@/types/data/workspace';
import { EditableHeader } from '../shared/EditableHeader';
import { SyncButton } from '@/components/shared/buttons/SyncButton';
import { itemActions } from '@/state/items';

export function ServicePanel({ id }: PanelProps) {
	const dispatch = useAppDispatch();
	const service = useSelector((state) => itemActions.service.select(state, id));

	function update(values: Partial<Service>) {
		dispatch(activeActions.updateService({ ...values, id }));
	}

	if (service == null) {
		throw new Error(`Service Panel could not find associated Service, id ${id}`);
	}

	return (
		<Stack gap={2} p={2}>
			<EditableHeader value={service.name} onChange={(name) => update({ name })} right={<SyncButton id={id} />} />
			<SprocketTabs
				tabs={[
					{
						title: 'General',
						content: <GeneralSection service={service} onChange={update} />,
					},
					{
						title: 'Environments',
						content: <EnvironmentsSection service={service} onChange={update} />,
					},
					{
						title: 'Scripts',
						content: (
							<AccordionGroup transition="0.2s ease">
								<PrePostScriptDisplay
									onChange={update}
									preRequestScript={service.preRequestScript}
									postRequestScript={service.postRequestScript}
								/>
							</AccordionGroup>
						),
					},
				]}
			/>
		</Stack>
	);
}
