import { Typography } from '@mui/joy';
import Table from '@mui/joy/Table';

import { Service } from '../../../types/application-data/application-data';
import { camelCaseToTitle } from '../../../utils/string';
import { EditableText } from '../../shared/input/EditableText';
import { SectionProps } from './sectionProps';

const serviceDataKeys = ['version', 'baseUrl'] as const satisfies readonly (keyof Service)[];

export function InformationSection({ data, onChange }: SectionProps) {
	return (
		<Table variant="outlined" borderAxis={'bothBetween'} sx={{ maxWidth: '70%', ml: 'auto', mr: 'auto' }}>
			<tbody>
				{serviceDataKeys.map((serviceDataKey, index) => (
					<tr key={index}>
						<td>
							<Typography level="body-md">{camelCaseToTitle(serviceDataKey)}</Typography>
						</td>
						<td>
							<EditableText
								text={data[serviceDataKey]}
								setText={(newText: string) => onChange({ [serviceDataKey]: `${newText}` })}
								isValidFunc={(text: string) => text.length >= 1}
							/>
						</td>
					</tr>
				))}
			</tbody>
		</Table>
	);
}
