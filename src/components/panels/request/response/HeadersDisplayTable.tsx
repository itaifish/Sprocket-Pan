import { KeyValuePair } from '@/classes/OrderedKeyValuePairs';
import { CopyToClipboardButton } from '@/components/shared/buttons/CopyToClipboardButton';
import { HoverDecorator } from '@/components/shared/HoverDecorator';
import { SprocketTable } from '@/components/shared/SprocketTable';
import { toKeyValuePairs } from '@/utils/application';
import { AccordionGroup, Accordion, AccordionSummary, AccordionDetails, Box } from '@mui/joy';

interface HeadersDisplayTableProps {
	headers?: KeyValuePair[] | null | Record<string, string>;
	label: 'request' | 'response';
}

export function HeadersDisplayTable({ headers, label }: HeadersDisplayTableProps) {
	if (headers == null) return <></>;
	headers = Array.isArray(headers) ? headers : toKeyValuePairs(headers);
	if (headers.length === 0) return <></>;
	return (
		<AccordionGroup>
			<Accordion defaultExpanded>
				<AccordionSummary>Headers</AccordionSummary>
				<AccordionDetails>
					<SprocketTable
						aria-label={`${label} Headers Table`}
						sx={{ overflowWrap: 'break-word' }}
						columns={[
							{ key: 'headerKey', label: 'Key' },
							{ key: 'value', label: 'Value' },
						]}
						data={headers.map(({ key, value }) => ({
							key,
							headerKey: key,
							value: (
								<HoverDecorator
									endDecorator={
										value != null && (
											<Box height="1.5em" marginTop="-.75em" width="0" marginLeft="-2em">
												<CopyToClipboardButton size="sm" copyText={value} />
											</Box>
										)
									}
									direction="row"
									justifyContent="space-between"
									alignItems="center"
								>
									{value}
								</HoverDecorator>
							),
						}))}
					/>
				</AccordionDetails>
			</Accordion>
		</AccordionGroup>
	);
}
