import { Fingerprint } from '@mui/icons-material';
import { Endpoint, EndpointRequest } from '../../../types/application-data/application-data';
import { CopyToClipboardButton } from '../../shared/buttons/CopyToClipboardButton';
import { Stack, Switch, Typography } from '@mui/joy';
import { useAppDispatch } from '../../../state/store';
import { activeActions } from '../../../state/active/slice';
import { useSelector } from 'react-redux';
import { selectEndpointById } from '../../../state/active/selectors';
import { SprocketTable } from '../../shared/SprocketTable';

export function RequestInfoSection({ request }: { request: EndpointRequest }) {
	const dispatch = useAppDispatch();
	const endpoint = useSelector((state) => selectEndpointById(state, request.endpointId));
	const isDefault = endpoint.defaultRequest === request.id;
	function updateAssociatedEndpoint(values: Partial<Endpoint>) {
		dispatch(activeActions.updateEndpoint({ ...values, id: request.endpointId }));
	}

	return (
		<SprocketTable
			columns={[{ key: 'title', style: { width: 200 } }, { key: 'value' }]}
			data={[
				{
					key: 'id',
					title: 'SprocketPan Request ID',
					value: (
						<Stack direction="row" alignItems="center" gap={1}>
							<CopyToClipboardButton tooltipText="Copy Request ID" copyText={request.id}>
								<Fingerprint />
							</CopyToClipboardButton>
							<Typography>{request.id}</Typography>
						</Stack>
					),
				},
				{
					key: 'default',
					title: 'Default Endpoint Request',
					value: (
						<Switch
							checked={isDefault}
							onChange={(_event: React.ChangeEvent<HTMLInputElement>) =>
								updateAssociatedEndpoint({
									defaultRequest: isDefault ? null : request.id,
								})
							}
							endDecorator={'Default'}
						/>
					),
				},
			]}
		/>
	);
}
