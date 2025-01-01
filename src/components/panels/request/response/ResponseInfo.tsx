import { Accordion, AccordionDetails, AccordionGroup, AccordionSummary, Typography } from '@mui/joy';
import { ResponseBody } from './ResponseBody';
import { HeadersDisplayTable } from './HeadersDisplayTable';
import { VisualEventLog } from './VisualEventLog';
import { SprocketTabs } from '@/components/shared/SprocketTabs';
import { UriTypography } from '@/components/shared/UriTypography';
import { statusCodes } from '@/constants/statusCodes';
import { HistoricalEndpointResponse } from '@/types/data/workspace';
import { toKeyValuePairs } from '@/utils/application';
import { formatFullDate } from '@/utils/string';
import { defaultResponse } from '../constants';
import { mergeDeep } from '@/utils/variables';

function autofillDefaults(entry: HistoricalEndpointResponse) {
	return mergeDeep(defaultResponse, entry);
}

interface ResponseInfoProps {
	data: HistoricalEndpointResponse;
	requestId: string;
}

export function ResponseInfo({ data, requestId }: ResponseInfoProps) {
	const { response, request, auditLog, error } = autofillDefaults(data);
	const timeDifference = (response.dateTime - request.dateTime) / 1000;
	return (
		<SprocketTabs
			tabs={[
				{
					title: 'Body',
					content: <ResponseBody response={response} error={error} />,
				},
				{
					title: 'Details',
					content: (
						<>
							<Typography left="p" sx={{ mb: 2 }}>
								At <u>{formatFullDate(response.dateTime)}</u>, {timeDifference} seconds after initializing the request,
								a{' '}
								<u>
									{response.statusCode} ({statusCodes[response.statusCode]})
								</u>{' '}
								response was received.
							</Typography>
							<HeadersDisplayTable headers={response.headers} label="response" />
						</>
					),
				},
				{
					title: 'Request',
					content: (
						<>
							<Typography left="p" sx={{ mb: 2 }}>
								At <u>{formatFullDate(request.dateTime)}</u>, a <u>{request.method}</u> request was sent to{' '}
								<UriTypography>{request.url}</UriTypography>.
							</Typography>
							<HeadersDisplayTable headers={request.headers} label="request" />
							{Object.keys(request.body).length > 0 && (
								<>
									<AccordionGroup>
										<Accordion defaultExpanded>
											<AccordionSummary>Request Body</AccordionSummary>
											<AccordionDetails>
												<ResponseBody
													response={{
														...request,
														headers: toKeyValuePairs(request.headers),
														bodyType: request.bodyType ?? 'JSON',
														statusCode: 0,
														body: request.body,
													}}
												/>
											</AccordionDetails>
										</Accordion>
									</AccordionGroup>
								</>
							)}
						</>
					),
				},
				{
					title: 'Event Log',
					content: auditLog ? <VisualEventLog auditLog={auditLog} requestId={requestId} /> : 'No Events Found',
				},
			]}
		/>
	);
}
