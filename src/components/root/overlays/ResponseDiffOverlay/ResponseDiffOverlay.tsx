import { IconButton, Sheet, Stack, Typography } from '@mui/joy';
import { useState } from 'react';
import { ResponseSelectForm, SelectedResponse } from './ResponseSelectForm';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { VisualEventLog } from '@/components/panels/request/response/VisualEventLog';
import { DiffText } from '@/components/shared/input/DiffText';
import { SprocketTabs } from '@/components/shared/SprocketTabs';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { UriTypography } from '@/components/shared/UriTypography';
import { VerbChip } from '@/components/shared/VerbChip';
import { statusCodes } from '@/constants/statusCodes';
import { DiffQueueEntry } from '@/state/tabs/slice';
import { headersToJson, multilineUrl } from '@/utils/serialization';
import { useSelector } from 'react-redux';
import { selectHistoryById } from '@/state/active/selectors';

function useGetResponseData(selection: SelectedResponse | null) {
	const history = useSelector((state) => selectHistoryById(state, selection?.id));
	if (selection == null || history == null) return null;
	return history[selection.index];
}

interface ResponseDiffOverlayProps {
	initialSelection: DiffQueueEntry;
}

export function ResponseDiffOverlay({ initialSelection }: ResponseDiffOverlayProps) {
	const [isFormCollapsed, setIsFormCollapsed] = useState(false);

	const [originalSelection, setOriginalSelection] = useState<SelectedResponse | null>(initialSelection.original);
	const [modifiedSelection, setModifiedSelection] = useState<SelectedResponse | null>(initialSelection.modified);

	const original = useGetResponseData(originalSelection);
	const modified = useGetResponseData(modifiedSelection);

	return (
		<Sheet sx={{ overflowY: 'auto', px: '20px', height: '85vh', width: '85vw' }}>
			<Stack gap={2} sx={{ height: '100%' }}>
				<Stack direction="row" gap={3} justifyContent="space-between">
					<ResponseSelectForm
						initialValue={initialSelection.original}
						onChange={setOriginalSelection}
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
						initialValue={initialSelection.modified}
						onChange={setModifiedSelection}
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
								title: 'Request Url',
								content: (
									<DiffText
										original={multilineUrl(original.request.url)}
										modified={multilineUrl(modified.request.url)}
									/>
								),
							},
							{
								title: 'Event Log',
								content: (
									<Stack direction="row" justifyContent="space-between">
										<VisualEventLog auditLog={original.auditLog ?? []} requestId={originalSelection?.id as string} />
										<VisualEventLog auditLog={modified.auditLog ?? []} requestId={modifiedSelection?.id as string} />
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
