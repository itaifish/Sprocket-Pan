import { IconButton, Sheet, Stack, Typography } from '@mui/joy';
import { useState } from 'react';
import { VisualEventLog } from '../../../panels/request/response/VisualEventLog';
import { statusCodes } from '../../../../constants/statusCodes';
import { KeyValuePair } from '../../../../classes/OrderedKeyValuePairs';
import { toKeyValuePairs } from '../../../../utils/application';
import { DiffText } from '../../../shared/input/DiffText';
import { SprocketTabs } from '../../../shared/SprocketTabs';
import { UriTypography } from '../../../shared/UriTypography';
import { VerbChip } from '../../../shared/VerbChip';
import { ResponseSelectForm, SelectedResponse } from './ResponseSelectForm';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { SprocketTooltip } from '../../../shared/SprocketTooltip';

function headersToJson(headers: Record<string, string> | KeyValuePair[]) {
	const convertedHeaders = Array.isArray(headers) ? headers.slice() : toKeyValuePairs(headers);
	return JSON.stringify(
		convertedHeaders
			.sort((e1, e2) => e1.key.localeCompare(e2.key))
			.reduce(
				(acc, curr) => {
					acc[curr.key] = curr.value ?? '';
					return acc;
				},
				{} as Record<string, string>,
			),
	);
}

interface ResponseDiffOverlayProps {
	initialSelection: SelectedResponse;
}

export function ResponseDiffOverlay({ initialSelection }: ResponseDiffOverlayProps) {
	const [isFormCollapsed, setIsFormCollapsed] = useState(false);

	const [selectedOriginalRequest, setSelectedOriginalRequest] = useState<SelectedResponse | null>(initialSelection);
	const [selectedModifiedRequest, setSelectedModifiedRequest] = useState<SelectedResponse | null>(initialSelection);

	const original = selectedOriginalRequest?.request?.history[selectedOriginalRequest?.index];
	const modified = selectedModifiedRequest?.request?.history[selectedModifiedRequest?.index];

	return (
		<Sheet sx={{ overflowY: 'auto', px: '20px', height: '85vh', width: '85vw' }}>
			<Stack gap={2} sx={{ height: '100%' }}>
				<Stack direction="row" gap={3} justifyContent="space-between">
					<ResponseSelectForm
						initialValue={initialSelection}
						onChange={setSelectedOriginalRequest}
						collapsed={isFormCollapsed}
					/>
					<SprocketTooltip text={isFormCollapsed ? 'Expand Form' : 'Hide Form'}>
						<IconButton
							sx={{ alignSelf: 'end', minWidth: '100px', flexGrow: 1 }}
							onClick={() => setIsFormCollapsed(!isFormCollapsed)}
							variant="plain"
							color="primary"
						>
							{isFormCollapsed ? <ExpandMore /> : <ExpandLess />}
						</IconButton>
					</SprocketTooltip>
					<ResponseSelectForm
						initialValue={initialSelection}
						onChange={setSelectedModifiedRequest}
						collapsed={isFormCollapsed}
						sx={{ alignItems: isFormCollapsed ? 'end' : 'start' }}
					/>
				</Stack>
				{original && modified && (
					<SprocketTabs
						sx={{ height: '100%' }}
						tabs={[
							{
								title: 'Response Body',
								content: (
									<DiffText
										original={original.response.body}
										modified={modified.response.body}
										originalLanguage={original.response.bodyType?.toLocaleLowerCase()}
										modifiedLanguage={modified.response.bodyType?.toLocaleLowerCase()}
									/>
								),
							},
							{
								title: 'Response Headers',
								content: (
									<Stack height="100%">
										<Stack direction="row" justifyContent="space-between">
											<Typography>
												{original.response.statusCode}: {statusCodes[original.response.statusCode]}
											</Typography>
											<Typography>
												{modified.response.statusCode}: {statusCodes[modified.response.statusCode]}
											</Typography>
										</Stack>
										<DiffText
											original={headersToJson(original.response.headers)}
											modified={headersToJson(modified.response.headers)}
										/>
									</Stack>
								),
							},
							{
								title: 'Request Body',
								content: (
									<Stack height="100%">
										<Stack direction="row" justifyContent="space-between" textAlign="center" gap={3}>
											<Stack direction="row" gap={1}>
												<VerbChip method={original.request.method} />
												<UriTypography>{original.request.url.split('?')[0]}</UriTypography>
											</Stack>
											<Stack direction="row" gap={1}>
												<UriTypography>{modified.request.url.split('?')[0]}</UriTypography>
												<VerbChip method={modified.request.method} />
											</Stack>
										</Stack>
										<DiffText
											original={original.request.body}
											modified={modified.request.body}
											originalLanguage={original.request.bodyType?.toLocaleLowerCase()}
											modifiedLanguage={modified.request.bodyType?.toLocaleLowerCase()}
										/>
									</Stack>
								),
							},
							{
								title: 'Request Headers',
								content: (
									<DiffText
										original={headersToJson(original.request.headers)}
										modified={headersToJson(modified.request.headers)}
									/>
								),
							},
							{
								title: 'Event Log',
								content: (
									<Stack direction="row" justifyContent="space-between">
										<VisualEventLog auditLog={original.auditLog ?? []} requestId={selectedOriginalRequest.request.id} />
										<VisualEventLog auditLog={modified.auditLog ?? []} requestId={selectedModifiedRequest.request.id} />
									</Stack>
								),
							},
						]}
					/>
				)}
			</Stack>
		</Sheet>
	);
}
