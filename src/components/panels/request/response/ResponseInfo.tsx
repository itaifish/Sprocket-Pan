import {
	Accordion,
	AccordionDetails,
	AccordionGroup,
	AccordionSummary,
	Tab,
	TabList,
	TabPanel,
	Tabs,
	Typography,
} from '@mui/joy';
import { ResponseBody } from './ResponseBody';
import { useState } from 'react';
import { HeadersDisplayTable } from './HeadersDisplayTable';
import { VisualEventLog } from './VisualEventLog';
import { HistoricalEndpointResponse } from '../../../../types/application-data/application-data';
import { ValuesOf } from '../../../../types/utils/utils';
import { formatFullDate, camelCaseToTitle } from '../../../../utils/string';
import { statusCodes } from '../../../../constants/statusCodes';
import { UriTypography } from '../../../shared/UriTypography';
import { toKeyValuePairs } from '../../../../utils/application';

const responseTabs = ['body', 'details', 'request', 'eventLog'] as const;
type ResponseTabType = ValuesOf<typeof responseTabs>;

interface ResponseInfoProps {
	response: HistoricalEndpointResponse;
	requestId: string;
}

export function ResponseInfo({ response, requestId }: ResponseInfoProps) {
	const [tab, setTab] = useState<ResponseTabType>('body');
	const timeDifference = (response.response.dateTime - response.request.dateTime) / 1000;
	return (
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
			<TabPanel value="body">
				<ResponseBody response={response.response} />
			</TabPanel>
			<TabPanel value="details">
				<Typography left="p" sx={{ mb: 2 }}>
					At <u>{formatFullDate(response.response.dateTime)}</u>, {timeDifference} seconds after initializing the
					request, a{' '}
					<u>
						{response.response.statusCode} ({statusCodes[response.response.statusCode]})
					</u>{' '}
					response was received.
				</Typography>
				<HeadersDisplayTable headers={response.response.headers} label="response" />
			</TabPanel>
			<TabPanel value="request">
				<Typography left="p" sx={{ mb: 2 }}>
					At <u>{formatFullDate(new Date(response.request.dateTime))}</u>, a <u>{response.request.method}</u> request
					was sent to <UriTypography>{response.request.url}</UriTypography>.
				</Typography>
				<HeadersDisplayTable headers={response.request.headers} label="request" />
				{Object.keys(response.request.body).length > 0 && (
					<>
						<AccordionGroup>
							<Accordion defaultExpanded>
								<AccordionSummary>Request Body</AccordionSummary>
								<AccordionDetails>
									<ResponseBody
										response={{
											...response.request,
											headers: toKeyValuePairs(response.request.headers),
											bodyType: response.request.bodyType ?? 'JSON',
											statusCode: 0,
											body: response.request.body,
										}}
									/>
								</AccordionDetails>
							</Accordion>
						</AccordionGroup>
					</>
				)}
			</TabPanel>
			<TabPanel value="eventLog">
				{response.auditLog ? (
					<VisualEventLog auditLog={response.auditLog} requestId={requestId} />
				) : (
					<>No Events Found</>
				)}
			</TabPanel>
		</Tabs>
	);
}
