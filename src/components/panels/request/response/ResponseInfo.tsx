import { Accordion, AccordionDetails, AccordionGroup, AccordionSummary, Typography } from '@mui/joy';
import { ResponseBody } from './ResponseBody';
import { HeadersDisplayTable } from './HeadersDisplayTable';
import { VisualEventLog } from './VisualEventLog';
import { HistoricalEndpointResponse } from '../../../../types/application-data/application-data';
import { formatFullDate } from '../../../../utils/string';
import { statusCodes } from '../../../../constants/statusCodes';
import { UriTypography } from '../../../shared/UriTypography';
import { toKeyValuePairs } from '../../../../utils/application';
import { SprocketTabs } from '../../../shared/SprocketTabs';

interface ResponseInfoProps {
	response: HistoricalEndpointResponse;
	requestId: string;
}

export function ResponseInfo({ response, requestId }: ResponseInfoProps) {
	const timeDifference = (response.response.dateTime - response.request.dateTime) / 1000;
	return (
		<SprocketTabs
			tabs={[
				{
					title: 'Body',
					content: <ResponseBody response={response.response} />,
				},
				{
					title: 'Details',
					content: (
						<>
							<Typography left="p" sx={{ mb: 2 }}>
								At <u>{formatFullDate(response.response.dateTime)}</u>, {timeDifference} seconds after initializing the
								request, a{' '}
								<u>
									{response.response.statusCode} ({statusCodes[response.response.statusCode]})
								</u>{' '}
								response was received.
							</Typography>
							<HeadersDisplayTable headers={response.response.headers} label="response" />
						</>
					),
				},
				{
					title: 'Request',
					content: (
						<>
							<Typography left="p" sx={{ mb: 2 }}>
								At <u>{formatFullDate(new Date(response.request.dateTime))}</u>, a <u>{response.request.method}</u>{' '}
								request was sent to <UriTypography>{response.request.url}</UriTypography>.
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
						</>
					),
				},
				{
					title: 'Event Log',
					content: response.auditLog ? (
						<VisualEventLog auditLog={response.auditLog} requestId={requestId} />
					) : (
						'No Events Found'
					),
				},
			]}
		/>
	);
}
