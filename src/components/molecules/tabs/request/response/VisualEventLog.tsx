import {
	ListItemDecorator,
	ListItemContent,
	Typography,
	IconButton,
	ListItem,
	Divider,
	List,
	Box,
	Stack,
	ListItemButton,
} from '@mui/joy';
import { useState } from 'react';
import { AuditLog, TransformedAuditLog, auditLogManager } from '../../../../../managers/AuditLogManager';
import { iconFromTabType } from '../../../../../types/application-data/application-data';
import { camelCaseToTitle, formatMilliseconds } from '../../../../../utils/string';
import { SprocketTooltip } from '../../../../atoms/SprocketTooltip';
import TimerIcon from '@mui/icons-material/Timer';
import AnchorIcon from '@mui/icons-material/Anchor';
import BadgeIcon from '@mui/icons-material/Badge';
import LaunchIcon from '@mui/icons-material/Launch';
import SendIcon from '@mui/icons-material/Send';
import CodeIcon from '@mui/icons-material/Code';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import WhereToVoteIcon from '@mui/icons-material/WhereToVote';
import { CollapseExpandButton } from '../../../../atoms/buttons/CollapseExpandButton';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../../../state/store';
import { addTabs, setSelectedTab } from '../../../../../state/tabs/slice';
import {
	selectEndpoints,
	selectEnvironments,
	selectRequests,
	selectScripts,
	selectServices,
} from '../../../../../state/active/selectors';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';

const indentationSize = 20;

const eventStrIconsMap = {
	Service: (
		<>
			{iconFromTabType.service}
			<CodeIcon />
		</>
	),
	Endpoint: (
		<>
			{iconFromTabType.endpoint}
			<CodeIcon />
		</>
	),
	Request: (
		<>
			{iconFromTabType.request}
			<CodeIcon />
		</>
	),
	request: (
		<>
			{iconFromTabType.request}
			<SendIcon />
		</>
	),
	root: <AnchorIcon />,
	standaloneScript: (
		<>
			<SelfImprovementIcon />
			{iconFromTabType.script}
		</>
	),
};

interface VisualEventLogInnerProps {
	transformedLog: TransformedAuditLog;
	requestId: string;
	indentation: number;
}

function VisualEventLogInner({ transformedLog, requestId, indentation }: VisualEventLogInnerProps) {
	const requests = useSelector(selectRequests);
	const environments = useSelector(selectEnvironments);
	const services = useSelector(selectServices);
	const endpoints = useSelector(selectEndpoints);
	const scripts = useSelector(selectScripts);
	const data = { requests, environments, services, endpoints, scripts };
	const dispatch = useAppDispatch();
	const [collapsed, setCollapsed] = useState(false);
	const requestEvent = transformedLog.before;
	const icons = (
		<>
			{requestEvent.eventType.includes('pre') && <ArrowDropUpIcon />}
			{requestEvent.eventType.includes('post') && <ArrowDropDownIcon />}
			{
				eventStrIconsMap[
					(Object.keys(eventStrIconsMap).find((event) => requestEvent.eventType.includes(event)) ??
						'request') as keyof typeof eventStrIconsMap
				]
			}
		</>
	);
	const dataType = requestEvent.eventType === 'root' ? null : auditLogManager.getEventDataType(requestEvent);
	return (
		<>
			<Box sx={{ pl: `${indentation}px` }}>
				<ListItemDecorator>
					<Box sx={{ mr: '5px' }}>{icons}</Box>
					{requestEvent.eventType === 'request' &&
						requestEvent.associatedId &&
						requests[requestEvent.associatedId].name}{' '}
					{camelCaseToTitle(requestEvent.eventType)}
					{transformedLog.innerEvents.length > 0 && (
						<CollapseExpandButton collapsed={collapsed} setCollapsed={setCollapsed} />
					)}
				</ListItemDecorator>
				<ListItemButton>
					<ListItemContent>
						<Typography level="title-sm"></Typography>
						<Typography level="body-sm">
							<Stack direction="row" alignItems="center" gap={1}>
								<TimerIcon />
								{formatMilliseconds(transformedLog.after.timestamp - transformedLog.before.timestamp)}
							</Stack>
							{dataType && requestEvent.associatedId && (
								<Stack direction="row" alignItems={'center'} gap={1}>
									<BadgeIcon />
									{data[`${dataType}s`][requestEvent.associatedId].name} {camelCaseToTitle(dataType)}
									{requestEvent.associatedId != requestId ? (
										<SprocketTooltip
											text={`Open ${data[`${dataType}s`][requestEvent.associatedId].name} ${camelCaseToTitle(
												dataType,
											)}`}
										>
											<IconButton
												size="sm"
												color="primary"
												onClick={() => {
													const id = requestEvent.associatedId as string;
													dispatch(addTabs({ [id]: dataType }));
													dispatch(setSelectedTab(id));
												}}
											>
												<LaunchIcon />
											</IconButton>
										</SprocketTooltip>
									) : (
										<SprocketTooltip
											text={
												requestEvent.eventType === 'request'
													? 'This is the current request'
													: `This is the ${camelCaseToTitle(
															requestEvent.eventType,
													  ).toLocaleLowerCase()} for this request`
											}
										>
											<WhereToVoteIcon color="success" />
										</SprocketTooltip>
									)}
								</Stack>
							)}
						</Typography>
					</ListItemContent>
				</ListItemButton>
			</Box>
			{transformedLog.innerEvents.length > 0 && !collapsed && (
				<ListItem nested sx={{ '--List-nestedInsetStart': '10rem' }}>
					{transformedLog.innerEvents.map((event, index) => (
						<Box key={index}>
							<Divider sx={{ my: '10px' }} />
							<VisualEventLogInner
								transformedLog={event}
								requestId={requestId}
								indentation={indentation + indentationSize}
							/>
						</Box>
					))}
				</ListItem>
			)}
		</>
	);
}

export function VisualEventLog(props: { auditLog: AuditLog; requestId: string }) {
	const transformedLog = auditLogManager.transformAuditLog(props.auditLog);
	return (
		<List sx={{ '--List-nestedInsetStart': '10rem' }}>
			{transformedLog && (
				<VisualEventLogInner transformedLog={transformedLog} requestId={props.requestId} indentation={0} />
			)}
		</List>
	);
}
