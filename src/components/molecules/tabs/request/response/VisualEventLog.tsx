import {
	ListItemDecorator,
	ListItemContent,
	Typography,
	IconButton,
	ListItem,
	Divider,
	List,
	styled,
	Box,
	Stack,
} from '@mui/joy';
import { useContext } from 'react';
import { AuditLog, TransformedAuditLog, auditLogManager } from '../../../../../managers/AuditLogManager';
import { ApplicationDataContext, TabsContext } from '../../../../../managers/GlobalContextManager';
import { tabsManager } from '../../../../../managers/TabsManager';
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
	root: (
		<>
			<AnchorIcon />
		</>
	),
};

const HoverBox = styled(Box)(({ theme }) => {
	const color = theme.vars.palette.neutral.darkChannel;
	return {
		'&:hover': {
			backgroundColor: `rgb(${color.replaceAll(' ', ', ')})`,
		},
	};
});

export function VisualEventLog(props: { auditLog: AuditLog; requestId: string }) {
	const data = useContext(ApplicationDataContext);
	const tabsContext = useContext(TabsContext);
	function VisualEventLogInner(props: { transformedLog: TransformedAuditLog; requestId: string }) {
		const requestEvent = props.transformedLog.before;
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
				<HoverBox>
					<ListItemDecorator>
						<Box sx={{ mr: '5px' }}>{icons}</Box>
						{requestEvent.eventType === 'request' &&
							requestEvent.associatedId &&
							data.requests[requestEvent.associatedId].name}{' '}
						{camelCaseToTitle(requestEvent.eventType)}
					</ListItemDecorator>
					<ListItemContent>
						<Typography level="title-sm"></Typography>
						<Typography level="body-sm">
							<Stack direction="row" alignItems="center" gap={1}>
								<TimerIcon />
								{formatMilliseconds(
									props.transformedLog.after.timestamp.getTime() - props.transformedLog.before.timestamp.getTime(),
								)}
							</Stack>
							{dataType && requestEvent.associatedId && (
								<Stack direction="row" alignItems={'center'} gap={1}>
									<BadgeIcon />
									{data[`${dataType}s`][requestEvent.associatedId].name} {camelCaseToTitle(dataType)}
									{requestEvent.associatedId != props.requestId ? (
										<SprocketTooltip
											text={`Open ${data[`${dataType}s`][requestEvent.associatedId].name} ${camelCaseToTitle(
												dataType,
											)}`}
										>
											<IconButton
												size="sm"
												color="primary"
												onClick={() => {
													tabsManager.selectTab(tabsContext, requestEvent.associatedId as string, dataType);
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
				</HoverBox>
				{props.transformedLog.innerEvents.length > 0 && (
					<ListItem nested>
						{props.transformedLog.innerEvents.map((event, index) => (
							<Box key={index}>
								<Divider sx={{ my: '10px' }} />
								<VisualEventLogInner transformedLog={event} requestId={props.requestId} />
							</Box>
						))}
					</ListItem>
				)}
			</>
		);
	}
	const transformedLog = auditLogManager.transformAuditLog(props.auditLog);
	return (
		<List>{transformedLog && <VisualEventLogInner transformedLog={transformedLog} requestId={props.requestId} />}</List>
	);
}
