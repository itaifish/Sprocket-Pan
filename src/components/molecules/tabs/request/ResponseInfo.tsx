import {
	Accordion,
	AccordionDetails,
	AccordionGroup,
	AccordionSummary,
	Divider,
	Tab,
	TabList,
	TabPanel,
	Table,
	Tabs,
	Typography,
} from '@mui/joy';
import { HistoricalEndpointResponse, SPHeaders } from '../../../../types/application-data/application-data';
import { ResponseBody } from './ResponseBody';
import { camelCaseToTitle, formatDate, statusCodes } from '../../../../utils/string';
import { useState } from 'react';
import { ValuesOf } from '../../../../types/utils/utils';

const responseTabs = ['responseBody', 'details'] as const;
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
			</Tabs>
		</>
	);
}
