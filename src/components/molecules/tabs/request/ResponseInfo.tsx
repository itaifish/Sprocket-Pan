import {
	Accordion,
	AccordionDetails,
	AccordionGroup,
	AccordionSummary,
	Box,
	Divider,
	List,
	ListItem,
	ListItemContent,
	ListItemDecorator,
	Stack,
	Tab,
	TabList,
	TabPanel,
	Table,
	Tabs,
	Typography,
	styled,
} from '@mui/joy';
import {
	HistoricalEndpointResponse,
	SPHeaders,
	iconFromTabType,
} from '../../../../types/application-data/application-data';
import { ResponseBody } from './ResponseBody';
import { camelCaseToTitle, formatDate, formatMilliseconds, statusCodes } from '../../../../utils/string';
import { useContext, useState } from 'react';
import { ValuesOf } from '../../../../types/utils/utils';
import { AuditLog, TransformedAuditLog, auditLogManager } from '../../../../managers/AuditLogManager';
import SendIcon from '@mui/icons-material/Send';
import CodeIcon from '@mui/icons-material/Code';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { ApplicationDataContext } from '../../../../managers/GlobalContextManager';
import TimerIcon from '@mui/icons-material/Timer';
import AnchorIcon from '@mui/icons-material/Anchor';
import BadgeIcon from '@mui/icons-material/Badge';

const responseTabs = ['responseBody', 'details', 'eventLog'] as const;
type ResponseTabType = ValuesOf<typeof responseTabs>;

function HeadersDisplayTable({
	headers,
	label,
}: {
	headers: Record<string, string> | SPHeaders;
	label: 'request' | 'response';
}) {
	let display = <></>;
	if (headers.__data && typeof headers.__data != 'string') {
		if (headers.__data.length == 0) {
			return <></>;
		}
		display = (
			<>
				{headers.__data.map(({ key, value }, index) => (
					<tr key={index}>
						<td>{key}</td>
						<td>{value}</td>
					</tr>
				))}
			</>
		);
	} else {
		if (Object.keys(headers).length == 0) {
			return <></>;
		}
		display = (
			<>
				{Object.entries(headers as Record<string, string>).map(([headerKey, headerVal], index) => (
					<tr key={index}>
						<td>{headerKey}</td>
						<td>{headerVal}</td>
					</tr>
				))}
			</>
		);
	}
	return (
		<AccordionGroup>
			<Accordion defaultExpanded>
				<AccordionSummary>Headers</AccordionSummary>
				<AccordionDetails>
					<Table aria-label={`Headers table for ${label}`} variant="outlined" sx={{ overflowWrap: 'break-word' }}>
						<thead>
							<tr>
								<th>Key</th>
								<th>Value</th>
							</tr>
						</thead>
						<tbody>{display}</tbody>
					</Table>
				</AccordionDetails>
			</Accordion>
		</AccordionGroup>
	);
}

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
			cursor: 'pointer',
			backgroundColor: `rgb(${color.replaceAll(' ', ', ')})`,
			bgColor: `rgb(${color.replaceAll(' ', ', ')})`,
		},
	};
});

export function VisualEventLog(props: { auditLog: AuditLog }) {
	const data = useContext(ApplicationDataContext);

	function VisualEventLogInner(props: { transformedLog: TransformedAuditLog }) {
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
								<Stack direction="row" alignContent={'center'} gap={1}>
									<BadgeIcon />
									{data[`${dataType}s`][requestEvent.associatedId].name} {camelCaseToTitle(dataType)}
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
								<VisualEventLogInner transformedLog={event} />
							</Box>
						))}
					</ListItem>
				)}
			</>
		);
	}
	const transformedLog = auditLogManager.transformAuditLog(props.auditLog);
	return <List>{transformedLog && <VisualEventLogInner transformedLog={transformedLog} />}</List>;
}

export function ResponseInfo({ response }: { response: HistoricalEndpointResponse }) {
	const [tab, setTab] = useState<ResponseTabType>('responseBody');
	const timeDifference =
		(new Date(response.response.dateTime).getTime() - new Date(response.request.dateTime).getTime()) / 1000;
	return (
		<>
			<Typography level="h2" textAlign={'center'}>
				{formatDate(response.response.dateTime)}
			</Typography>
			<Tabs
				aria-label="tabs"
				size="lg"
				value={tab}
				onChange={(_event, newValue) => {
					const newTabId = newValue as ResponseTabType;
					setTab(newTabId);
				}}
			>
				<TabList color="primary">
					{responseTabs.map((curTab, index) => (
						<Tab color={curTab === tab ? 'primary' : 'neutral'} value={curTab} key={index}>
							{camelCaseToTitle(curTab)}
						</Tab>
					))}
				</TabList>
				<TabPanel value={'responseBody'}>
					{response.response.statusCode}: {statusCodes[response.response.statusCode]}
					<ResponseBody response={response.response} />
				</TabPanel>
				<TabPanel value={'details'}>
					<Typography level={'h3'} sx={{ mb: 2 }}>
						Request
					</Typography>
					<Typography left="p" sx={{ mb: 2 }}>
						At <u>{formatDate(response.request.dateTime)}</u>, a <u>{response.request.method}</u> request was sent to{' '}
						<u>{response.request.url}</u>.{' '}
					</Typography>
					<HeadersDisplayTable headers={response.request.headers} label="request" />
					{Object.keys(response.request.body).length > 0 && (
						<>
							<AccordionGroup>
								<Accordion defaultExpanded>
									<AccordionSummary>Body</AccordionSummary>
									<AccordionDetails>
										<ResponseBody
											response={{
												...response.request,
												bodyType: 'JSON',
												statusCode: 0,
												body: JSON.stringify(response.request.body),
											}}
										/>
									</AccordionDetails>
								</Accordion>
							</AccordionGroup>
						</>
					)}
					<Divider sx={{ my: 10 }} />
					<Typography level={'h3'} sx={{ mb: 2 }}>
						Response
					</Typography>
					<Typography left="p" sx={{ mb: 2 }}>
						{timeDifference} seconds later at <u>{formatDate(response.response.dateTime)}</u>, a{' '}
						<u>
							{response.response.statusCode} ({statusCodes[response.response.statusCode]})
						</u>{' '}
						response was recieved.
					</Typography>
					<HeadersDisplayTable headers={response.response.headers} label="response" />
				</TabPanel>
				<TabPanel value="eventLog">
					{response.auditLog ? (
						<>
							<VisualEventLog auditLog={response.auditLog} />
						</>
					) : (
						<>No Events Found.</>
					)}
				</TabPanel>
			</Tabs>
		</>
	);
}
