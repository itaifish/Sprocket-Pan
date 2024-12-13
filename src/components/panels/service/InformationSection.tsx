import { Select, Stack, Typography, Option } from '@mui/joy';
import { SectionProps } from './sectionProps';
import { Link } from '@mui/icons-material';
import { EditableText } from '@/components/shared/input/EditableText';
import { SprocketTable } from '@/components/shared/SprocketTable';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { Service } from '@/types/data/workspace';
import { camelCaseToTitle } from '@/utils/string';

const serviceDataKeys = ['version', 'baseUrl'] as const satisfies readonly (keyof Service)[];

export function InformationSection({ data, onChange }: SectionProps) {
	const activeEnv = data.selectedEnvironment == null ? null : data.localEnvironments[data.selectedEnvironment];
	const envList = Object.values(data.localEnvironments);
	return (
		<SprocketTable
			borderAxis="bothBetween"
			columns={[{ key: 'title', style: { width: 175 } }, { key: 'value' }]}
			data={[
				...serviceDataKeys.map((serviceDataKey) => ({
					key: serviceDataKey,
					title: <Typography level="body-md">{camelCaseToTitle(serviceDataKey)}</Typography>,
					value: (
						<EditableText
							text={data[serviceDataKey]}
							setText={(newText: string) => onChange({ [serviceDataKey]: `${newText}` })}
							isValidFunc={(text: string) => text.length >= 1}
						/>
					),
				})),
				{
					key: 'activeEnv',
					title: <Typography level="body-md">Active Environment</Typography>,
					value: data.linkedEnvMode ? (
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
					),
				},
			]}
		/>
	);
}
