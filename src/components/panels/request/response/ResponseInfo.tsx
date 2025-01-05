import { Accordion, AccordionDetails, AccordionGroup, AccordionSummary, Typography } from '@mui/joy';
import { getEditorLanguage, ResponseBody } from './ResponseBody';
import { HeadersDisplayTable } from './HeadersDisplayTable';
import { VisualEventLog } from './VisualEventLog';
import { SprocketTabs } from '@/components/shared/SprocketTabs';
import { UriTypography } from '@/components/shared/UriTypography';
import { statusCodes } from '@/constants/statusCodes';
import { HistoricalEndpointResponse } from '@/types/data/workspace';
import { formatFullDate } from '@/utils/string';
import { defaultResponse } from '../constants';
import { mergeDeep } from '@/utils/variables';
import { SprocketEditor } from '@/components/shared/input/monaco/SprocketEditor';

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
												<SprocketEditor
													// https://github.com/itaifish/Sprocket-Pan/issues/138
													height="calc(100vh - 350px)"
													value={response.body}
													language={getEditorLanguage(response.bodyType)}
													options={{ readOnly: true, domReadOnly: true }}
													formatOnChange
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
