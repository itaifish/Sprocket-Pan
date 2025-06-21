import { FluentSelectAllOff } from '@/assets/icons/fluent/FluentSelectAllOff';
import { FluentSelectAllOn } from '@/assets/icons/fluent/FluentSelectAllOn';
import { CopyToClipboardButton } from '@/components/shared/buttons/CopyToClipboardButton';
import { DissolvingButton } from '@/components/shared/buttons/DissolvingButton';
import { SyncButton } from '@/components/shared/buttons/SyncButton';
import { EnvironmentTypography } from '@/components/shared/EnvironmentTypography';
import { SprocketTable } from '@/components/shared/SprocketTable';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { selectEnvironmentSnippets } from '@/state/active/selectors';
import { activeActions } from '@/state/active/slice';
import { useAppDispatch } from '@/state/store';
import { uiActions } from '@/state/ui/slice';
import { EndpointRequest, Endpoint } from '@/types/data/workspace';
import { Edit, Fingerprint } from '@mui/icons-material';
import { Card, Stack, Typography, IconButton } from '@mui/joy';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { VerbSelect } from '../shared/VerbSelect';
import { itemActions } from '@/state/items';

export interface RequestInfoSectionProps {
	request: EndpointRequest;
}

export function RequestInfoSection({ request }: RequestInfoSectionProps) {
	const dispatch = useAppDispatch();
	const endpoint = useSelector((state) => itemActions.endpoint.select(state, request.endpointId));
	const envSnippets = useSelector((state) => selectEnvironmentSnippets(state, request.id));
	const [shouldDissolvingAnimate, setShouldDissolvingAnimate] = useState(false);

	const triggerDissolve = () => setShouldDissolvingAnimate(true);
	const endDissolve = () => setShouldDissolvingAnimate(false);

	if (endpoint == null) {
		throw new Error('endpoint is null in the requestInfoSection');
	}

	const isDefault = endpoint.defaultRequest === request.id;
	function updateAssociatedEndpoint(values: Partial<Endpoint>) {
		dispatch(activeActions.updateEndpoint({ ...values, id: request.endpointId }));
	}

	return (
		<Stack gap={2} sx={{ overflowX: 'hidden' }}>
			<Stack direction="row" gap={2} width="100%" alignItems="center" justifyContent="space-between">
				<VerbSelect value={endpoint.verb} open={false} onClick={triggerDissolve} />
				<Stack direction="row" gap={1}>
					<SprocketTooltip text={isDefault ? 'Unset as Default Request' : 'Set As Default Request'}>
						<IconButton
							color={isDefault ? 'primary' : 'neutral'}
							variant="soft"
							onClick={() =>
								updateAssociatedEndpoint({
									defaultRequest: isDefault ? null : request.id,
								})
							}
						>
							{isDefault ? <FluentSelectAllOn /> : <FluentSelectAllOff />}
						</IconButton>
					</SprocketTooltip>
					<SyncButton placement="bottom" variant="soft" id={request.id} />
					<DissolvingButton height="30px" shouldAnimate={shouldDissolvingAnimate} clearShouldAnimate={endDissolve}>
						<SprocketTooltip text="Edit Parent Endpoint">
							<IconButton
								variant="outlined"
								color="primary"
								onClick={() => {
									dispatch(uiActions.addTab(request.endpointId));
									dispatch(uiActions.setSelectedTab(request.endpointId));
								}}
							>
								<Edit />
							</IconButton>
						</SprocketTooltip>
					</DissolvingButton>
				</Stack>
			</Stack>
			<Card
				variant="outlined"
				color="primary"
				onClick={triggerDissolve}
				sx={{
					'--Card-padding': '6px',
					overflowWrap: 'anywhere',
					wordBreak: 'break-all',
					flexGrow: 1,
				}}
			>
				<EnvironmentTypography snippets={envSnippets} />
			</Card>
			<SprocketTable
				columns={[{ key: 'title', style: { width: 200 } }, { key: 'value' }]}
				data={[
					{
						key: 'id',
						title: 'SprocketPan Request ID',
						value: (
							<Typography
								startDecorator={
									<CopyToClipboardButton tooltipText="Copy Request ID" copyText={request.id}>
										<Fingerprint />
									</CopyToClipboardButton>
								}
							>
								{request.id}
							</Typography>
						),
					},
				]}
			/>
		</Stack>
	);
}
