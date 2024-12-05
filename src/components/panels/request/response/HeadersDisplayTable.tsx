import { AccordionGroup, Accordion, AccordionSummary, AccordionDetails, Table } from '@mui/joy';
import { KeyValuePair } from '../../../../classes/OrderedKeyValuePairs';
import { toKeyValuePairs } from '../../../../utils/application';

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
					<Table aria-label={`Headers table for ${label}`} variant="outlined" sx={{ overflowWrap: 'break-word' }}>
						<thead>
							<tr>
								<th>Key</th>
								<th>Value</th>
							</tr>
						</thead>
						<tbody>
							{headers.map(({ key, value }, index) => (
								<tr key={index}>
									<td>{key}</td>
									<td>{value}</td>
								</tr>
							))}
						</tbody>
					</Table>
				</AccordionDetails>
			</Accordion>
		</AccordionGroup>
	);
}
