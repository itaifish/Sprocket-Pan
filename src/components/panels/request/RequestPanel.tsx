import { Stack, CircularProgress, Button, Box } from '@mui/joy';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RequestEditTabs } from './RequestEditTabs';
import { ResponsePanel } from './response/ResponsePanel';
import { selectFullRequestInfoById, selectSettings } from '@/state/active/selectors';
import { activeActions } from '@/state/active/slice';
import { useAppDispatch } from '@/state/store';
import { EndpointRequest } from '@/types/data/workspace';
import { PanelProps } from '../panels.interface';
import { networkRequestManager } from '@/managers/NetworkRequestManager';
import { Send } from '@mui/icons-material';
import { EditableText } from '@/components/shared/input/EditableText';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { SprocketResizeHandle } from '@/components/shared/SprocketResizeHandle';
import { TrapezoidalHeader } from '@/components/shared/flair/TrapezoidalHeader';
import { useScrollbarTheme } from '@/hooks/useScrollbarTheme';

export function RequestPanel({ id }: PanelProps) {
	const { request, endpoint, service } = useSelector((state) => selectFullRequestInfoById(state, id));
	const settings = useSelector(selectSettings);
	const [isLoading, setLoading] = useState(false);
	const { guttered: scrollbarTheme } = useScrollbarTheme();

	const dispatch = useAppDispatch();

	if (request == null || endpoint == null || service == null) {
		return <>Request data not found</>;
	}

	async function sendRequest() {
		if (isLoading) {
			return;
		}
		setLoading(true);
		const result = await networkRequestManager.makeRequestWithScripts(request.id);
		dispatch(
			activeActions.addResponseToHistory({
				requestId: request.id,
				...result,
				maxLength: settings.history.maxLength,
				discard: settings.history.enabled,
			}),
		);
		setLoading(false);
	}

	function update(values: Partial<EndpointRequest>) {
		dispatch(activeActions.updateRequest({ ...values, id: request.id }));
	}

	return (
		<PanelGroup direction="horizontal">
			<Panel defaultSize={50} minSize={33}>
				<Box height="100%" sx={{ overflow: 'auto', ...scrollbarTheme }}>
					<TrapezoidalHeader>Request</TrapezoidalHeader>
					<Stack gap={1} p={2} minWidth="400px">
						<Stack direction="row" justifyContent="space-between">
							<EditableText level="title-lg" text={request.name} setText={(name) => update({ name })} />
							<Button
								color={isLoading ? 'warning' : 'primary'}
								startDecorator={isLoading ? <CircularProgress /> : <Send />}
								onClick={sendRequest}
								sx={{ minWidth: 150 }}
							>
								Send{isLoading ? 'ing' : ''}
							</Button>
						</Stack>
						<RequestEditTabs request={request} />
					</Stack>
				</Box>
			</Panel>
			<SprocketResizeHandle sx={{ my: 7 }} />
			<Panel defaultSize={50} minSize={33}>
				<Box height="100%" sx={{ overflowY: 'auto', ...scrollbarTheme }}>
					<TrapezoidalHeader reverse>Response</TrapezoidalHeader>
					<Stack gap={1} p={2} minWidth="400px">
						<ResponsePanel request={request} />
					</Stack>
				</Box>
			</Panel>
		</PanelGroup>
	);
}
