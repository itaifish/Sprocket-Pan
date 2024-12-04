import { Select, Stack, Typography, Option } from '@mui/joy';
import Table from '@mui/joy/Table';
import { Service } from '../../../types/application-data/application-data';
import { camelCaseToTitle } from '../../../utils/string';
import { EditableText } from '../../shared/input/EditableText';
import { SectionProps } from './sectionProps';
import { Link } from '@mui/icons-material';
import { SprocketTooltip } from '../../shared/SprocketTooltip';

const serviceDataKeys = ['version', 'baseUrl'] as const satisfies readonly (keyof Service)[];

export function InformationSection({ data, onChange }: SectionProps) {
	const activeEnv = data.selectedEnvironment == null ? null : data.localEnvironments[data.selectedEnvironment];
	const envList = Object.values(data.localEnvironments);
	return (
		<Table variant="outlined" borderAxis={'bothBetween'}>
			<tbody>
				{serviceDataKeys.map((serviceDataKey, index) => (
					<tr key={index}>
						<td width="150px">
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
				<tr>
					<td width="150px">
						<Typography level="body-md">Active Environment</Typography>
					</td>
					<td>
						{data.linkedEnvMode ? (
							<Stack direction="row" gap={1} ml="3px">
								<SprocketTooltip text="Linked Environment">
									<Link />
								</SprocketTooltip>
								<Typography>{activeEnv?.name ?? 'None'}</Typography>
							</Stack>
						) : (
							<Select
								placeholder="None"
								value={activeEnv?.id ?? null}
								onChange={(_, value) => onChange({ selectedEnvironment: value ?? undefined })}
							>
								{envList.map((env) => (
									<Option value={env.id} key={env.id}>
										{env.name}
									</Option>
								))}
							</Select>
						)}
					</td>
				</tr>
			</tbody>
		</Table>
	);
}
