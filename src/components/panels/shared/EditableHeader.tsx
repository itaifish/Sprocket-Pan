import { EditableText } from '@/components/shared/input/EditableText';
import { Box, Stack } from '@mui/joy';

interface EditableHeaderProps {
	onChange: (text: string) => void;
	value: string;
	left?: React.ReactNode;
	right?: React.ReactNode;
	isValidFunc?: (text: string) => boolean;
}

export function EditableHeader({
	onChange,
	value,
	left,
	right,
	isValidFunc = (text) => text.length >= 1,
}: EditableHeaderProps) {
	return (
		<Stack direction="row" alignItems="center" justifyContent="stretch" maxWidth="100%">
			<Box minWidth="fit-content" width="25%">
				{left}
			</Box>
			<EditableText sx={{ margin: 'auto' }} text={value} setText={onChange} isValidFunc={isValidFunc} level="h2" />
			<Stack minWidth="fit-content" width="25%" alignItems="end">
				{right}
			</Stack>
		</Stack>
	);
}
