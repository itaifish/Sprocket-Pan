import { verbColors } from '@/constants/style';
import { RESTfulRequestVerb, RESTfulRequestVerbs } from '@/types/data/shared';
import { Label } from '@mui/icons-material';
import { Select, Option } from '@mui/joy';
import chroma from 'chroma-js';

interface VerbSelectProps {
	value: RESTfulRequestVerb;
	onChange?: (newVal: RESTfulRequestVerb) => void;
	open?: boolean;
	onClick?: () => void;
}

export function VerbSelect({ value, onChange, open, onClick }: VerbSelectProps) {
	const color = verbColors[value];
	const backgroundColor = chroma(color).alpha(0.1).hex();
	return (
		<Select
			sx={{
				minWidth: 150,
				backgroundColor,
				color: color,
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
			{RESTfulRequestVerbs.map((verb, index) => {
				const color = chroma(verbColors[verb]);
				return (
					<Option
						key={index}
						value={verb}
						sx={{
							backgroundColor: color.alpha(0.1).hex(),
							color: color.hex(),
							':hover': { backgroundColor: color.alpha(0.2).hex() + '!important' },
						}}
					>
						{verb}
					</Option>
				);
			})}
		</Select>
	);
}
