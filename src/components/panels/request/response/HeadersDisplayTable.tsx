import { AccordionGroup, Accordion, AccordionSummary, AccordionDetails } from '@mui/joy';
import { KeyValuePair } from '../../../../classes/OrderedKeyValuePairs';
import { toKeyValuePairs } from '../../../../utils/application';
import { SprocketTable } from '../../../shared/SprocketTable';

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
						data={headers.map(({ key, value }) => ({ key, headerKey: key, value }))}
					/>
				</AccordionDetails>
			</Accordion>
		</AccordionGroup>
	);
}
