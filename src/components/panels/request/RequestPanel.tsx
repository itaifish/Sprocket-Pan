import { Typography, Card, Divider, Stack, IconButton, Box } from '@mui/joy';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RequestEditTabs } from './RequestEditTabs';
import { RequestActions, ResponseState } from './RequestActions';
import { defaultResponse } from './constants';
import { ResponsePanel } from './response/ResponsePanel';
import EditIcon from '@mui/icons-material/Edit';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { DissolvingButton } from '@/components/shared/buttons/DissolvingButton';
import { EditableText } from '@/components/shared/input/EditableText';
import { selectFullRequestInfoById } from '@/state/active/selectors';
import { activeActions } from '@/state/active/slice';
import { useAppDispatch } from '@/state/store';
import { tabsActions } from '@/state/tabs/slice';
import { EndpointRequest } from '@/types/data/workspace';
import { PanelProps } from '../panels.interface';

export function RequestPanel({ id }: PanelProps) {
	const { request, endpoint, service } = useSelector((state) => selectFullRequestInfoById(state, id));

	const [responseState, setResponseState] = useState<ResponseState>('latest');
	const [lastError, setLastError] = useState(defaultResponse);
	const [shouldDissolvingAnimate, setShouldDissolvingAnimate] = useState(false);

	const triggerDissolve = () => setShouldDissolvingAnimate(true);
	const endDissolve = () => setShouldDissolvingAnimate(false);

	const dispatch = useAppDispatch();

	if (request == null || endpoint == null || service == null) {
		return <>Request data not found</>;
	}

	function update(values: Partial<EndpointRequest>) {
		dispatch(activeActions.updateRequest({ ...values, id: request.id }));
	}

	return (
		<Stack gap={2}>
			<Box position="absolute" top={0} left={0}>
				<DissolvingButton shouldAnimate={shouldDissolvingAnimate} clearShouldAnimate={endDissolve}>
					<SprocketTooltip text="Edit Parent Endpoint">
						<IconButton
							variant="outlined"
							color="primary"
							onClick={() => {
								dispatch(tabsActions.addTabs({ [request.endpointId]: 'endpoint' }));
								dispatch(tabsActions.setSelectedTab(request.endpointId));
							}}
						>
							<EditIcon />
						</IconButton>
					</SprocketTooltip>
				</DissolvingButton>
			</Box>
			<EditableText
				sx={{ margin: 'auto' }}
				text={request.name}
				setText={(newText: string) => update({ name: newText })}
				isValidFunc={(text: string) => text.length >= 1}
				level="h2"
			/>
			<RequestActions
				activateEditButton={triggerDissolve}
				endpoint={endpoint}
				request={request}
				onError={setLastError}
				onResponse={setResponseState}
			/>
			<Stack direction="row" gap={2}>
				<Card sx={{ width: '1px', flexGrow: 1, height: 'fit-content' }}>
					<Typography level="h3" sx={{ textAlign: 'center' }}>
						Request
					</Typography>
					<Divider />
					<RequestEditTabs request={request} />
				</Card>
				<Card sx={{ width: '1px', flexGrow: 1, height: 'fit-content' }}>
					<Typography level="h3" sx={{ textAlign: 'center' }}>
						Response
					</Typography>
					<Divider />
					<ResponsePanel
						responseState={responseState}
						setResponseState={setResponseState}
						lastError={lastError}
						request={request}
					/>
				</Card>
			</Stack>
		</Stack>
	);
}
