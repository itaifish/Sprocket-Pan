import { Box, Divider, Stack, Typography } from '@mui/joy';
import { InformationSection } from './InformationSection';
import { RecentRequestsSection } from './RecentRequestsSection';
import { SectionProps } from './sectionProps';
import { EditableTextArea } from '@/components/shared/input/EditableTextArea';

export function GeneralSection({ data, onChange }: SectionProps) {
	return (
		<Stack gap={3} divider={<Divider />}>
			<Stack direction="row" gap={3} width="100%" justifyContent="stretch" flexWrap="wrap">
				<Box width="50%" minWidth="400px" flex={1}>
					<EditableTextArea
						text={data.description}
						setText={(newText: string) => onChange({ description: newText })}
						isValidFunc={(text: string) => text.length >= 1}
					/>
				</Box>
				<Box width="50%" minWidth="400px" flex={1}>
					<InformationSection data={data} onChange={onChange} />
				</Box>
			</Stack>
			<Stack gap={2}>
				<Typography level="h4">Recent Requests</Typography>
				<RecentRequestsSection data={data} />
			</Stack>
		</Stack>
	);
}
