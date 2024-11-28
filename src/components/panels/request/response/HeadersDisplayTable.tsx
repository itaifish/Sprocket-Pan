import { AccordionGroup, Accordion, AccordionSummary, AccordionDetails, Table } from '@mui/joy';
import { SPHeaders } from '../../../../types/application-data/application-data';

interface HeadersDisplayTableProps {
	headers: SPHeaders;
	label: 'request' | 'response';
}

export function HeadersDisplayTable({ headers, label }: HeadersDisplayTableProps) {
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
							{headers.toArray().map(({ key, value }, index) => (
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
