import { Typography, Divider, Stack } from '@mui/joy';
import { HistoryControl } from './HistoryControl';
import { ResponseInfo } from './ResponseInfo';
import { OpenDiffToolButton } from './OpenDiffToolButton';
import { activeActions } from '@/state/active/slice';
import { useAppDispatch } from '@/state/store';
import { EndpointRequest } from '@/types/data/workspace';
import { formatFullDate } from '@/utils/string';
import { useSelector } from 'react-redux';
import { selectHistoryById } from '@/state/active/selectors';
import { useEffect, useState } from 'react';

interface ResponsePanelProps {
	request: EndpointRequest;
}

export function ResponsePanel({ request }: ResponsePanelProps) {
	const dispatch = useAppDispatch();
	const history = useSelector((state) => selectHistoryById(state, request.id));
	const [index, setIndex] = useState(history.length - 1);
	const data = history[index];

	useEffect(() => {
		if (index === history.length - 2) setIndex(history.length - 1);
	}, [history]);

	if (data == null) {
		return (
			<Stack justifyContent="center" alignItems="center" height="100%" width="100%">
				<Typography level="title-md">No Response Data Available</Typography>
				<Typography>Make a request to see the response here!</Typography>
			</Stack>
		);
	}

	return (
		<>
			<Stack direction="row" justifyContent="space-between" alignItems="center">
				<Typography level="title-md" textAlign="center">
					{data.response == null ? 'No Response Found' : formatFullDate(data.response.dateTime)}
				</Typography>
				<Stack direction="row" spacing={0}>
					<OpenDiffToolButton historyIndex={index} id={request.id} />
					<HistoryControl
						value={index}
						onChange={setIndex}
						historyLength={history.length}
						onDelete={(index) =>
							dispatch(activeActions.deleteResponseFromHistory({ requestId: request.id, historyIndex: index }))
						}
					/>
				</Stack>
			</Stack>
			<Divider />
			<ResponseInfo data={data} requestId={request.id} />
		</>
	);
}
