import { verbColors } from '@/constants/style';
import { RESTfulRequestVerb, RESTfulRequestVerbs } from '@/types/data/shared';
import { Label } from '@mui/icons-material';
import { Select, Option } from '@mui/joy';
import { alpha } from '@mui/material';

interface VerbSelectProps {
	value: RESTfulRequestVerb;
	onChange?: (newVal: RESTfulRequestVerb) => void;
	open?: boolean;
	onClick?: () => void;
}

export function VerbSelect({ value, onChange, open, onClick }: VerbSelectProps) {
	return (
		<Select
			sx={{
				minWidth: 150,
				backgroundColor: alpha(verbColors[value], 0.15),
				color: verbColors[value],
			}}
			listboxOpen={open}
			onListboxOpenChange={onClick}
			value={value}
			startDecorator={<Label sx={{ color: verbColors[value] }} />}
			variant="soft"
			onChange={(_, newVerb) => {
				if (newVerb) {
					onChange?.(newVerb);
				}
			}}
		>
			{RESTfulRequestVerbs.map((verb, index) => (
				<Option
					key={index}
					value={verb}
					sx={{ backgroundColor: alpha(verbColors[verb], 0.15), color: verbColors[verb] }}
				>
					{verb}
				</Option>
			))}
		</Select>
	);
}
