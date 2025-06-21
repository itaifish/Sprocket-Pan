import { createPalette } from '@/utils/style';
import { Box, FormLabel, Stack } from '@mui/joy';
import { useState } from 'react';

export interface PaletteSelectProps {
	label?: string;
	value: string;
	onChange: (color: string) => void;
}

export function PaletteSelect({ label, value, onChange }: PaletteSelectProps) {
	const [palette, setPalette] = useState(createPalette(value));
	const onColorSelect = (newColor: string) => {
		onChange(newColor);
		setPalette(createPalette(newColor));
	};
	const paletteList = Object.values(palette);
	return (
		<div>
			<FormLabel sx={{ mb: 1 }}>{label}</FormLabel>
			<Stack direction="row">
				<Box position="relative">
					<Stack direction="row">
						{paletteList.map((color, index) => (
							<Box key={index} sx={{ backgroundColor: color, height: '27px', width: '27px' }} />
						))}
					</Stack>
				</Box>
				<input type="color" defaultValue={value} onBlur={(event) => onColorSelect(event.target.value)} />
			</Stack>
		</div>
	);
}
