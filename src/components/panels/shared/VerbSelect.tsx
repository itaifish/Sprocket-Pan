import { verbColors } from '@/constants/style';
import { RESTfulRequestVerb, RESTfulRequestVerbs } from '@/types/data/shared';
import { Label } from '@mui/icons-material';
import { Select, Option } from '@mui/joy';

interface VerbSelectProps {
	value: RESTfulRequestVerb;
	onChange?: (newVal: RESTfulRequestVerb) => void;
	open?: boolean;
	onClick?: () => void;
}

export function VerbSelect({ value, onChange, open, onClick }: VerbSelectProps) {
	const { color } = verbColors[value];
	return (
		<Select
			sx={{
				minWidth: 150,
				color,
			}}
			listboxOpen={open}
			onListboxOpenChange={onClick}
			value={value}
			startDecorator={<Label sx={{ color }} />}
			variant="soft"
			onChange={(_, newVerb) => {
				if (newVerb) {
					onChange?.(newVerb);
				}
			}}
		>
			{RESTfulRequestVerbs.map((verb, index) => (
				<Option key={index} value={verb} sx={{ color: verbColors[verb].color }}>
					{verb}
				</Option>
			))}
		</Select>
	);
}
