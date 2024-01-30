import { AccordionGroup, Accordion, AccordionSummary, AccordionDetails, Table } from '@mui/joy';
import { SPHeaders } from '../../../../../types/application-data/application-data';

interface HeadersDisplayTableProps {
	headers: Record<string, string> | SPHeaders;
	label: 'request' | 'response';
}

export function HeadersDisplayTable({ headers, label }: HeadersDisplayTableProps) {
	let display = null;
	if (headers.__data && typeof headers.__data != 'string') {
		if (headers.__data.length !== 0) {
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
		}
	} else {
		if (Object.keys(headers).length !== 0) {
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
	}
	if (display === null) {
		return <></>;
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
