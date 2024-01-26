import {
	Accordion,
	AccordionDetails,
	AccordionGroup,
	AccordionSummary,
	Divider,
	Tab,
	TabList,
	TabPanel,
	Tabs,
	Typography,
} from '@mui/joy';
import { HistoricalEndpointResponse } from '../../../../../types/application-data/application-data';
import { ResponseBody } from './ResponseBody';
import { camelCaseToTitle, formatDate, statusCodes } from '../../../../../utils/string';
import { useState } from 'react';
import { ValuesOf } from '../../../../../types/utils/utils';
import { HeadersDisplayTable } from './HeadersDisplayTable';
import { VisualEventLog } from './VisualEventLog';

const responseTabs = ['responseBody', 'details', 'eventLog'] as const;
type ResponseTabType = ValuesOf<typeof responseTabs>;

export function ResponseInfo({ response, requestId }: { response: HistoricalEndpointResponse; requestId: string }) {
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
							<VisualEventLog auditLog={response.auditLog} requestId={requestId} />
						</>
					) : (
						<>No Events Found.</>
					)}
				</TabPanel>
			</Tabs>
		</>
	);
}
