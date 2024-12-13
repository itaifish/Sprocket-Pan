import * as React from 'react';
import { Box, FormLabel, Grid, Input, Slider } from '@mui/joy';
import { clamp } from '@/utils/math';

export interface InputSliderProps {
	label: string;
	value: number;
	onChange: (val: number) => void;
	endDecorator?: React.ReactNode;
	icon: React.ReactNode;
	range: {
		min: number;
		max: number;
	};
}

export function InputSlider({ label, value, onChange, endDecorator, icon, range }: InputSliderProps) {
	return (
		<Box sx={{ width: 350 }}>
			<FormLabel id={`input-slider-${label}`}>{label}</FormLabel>
			<Grid container spacing={2} alignItems="center">
				<Grid>{icon}</Grid>
				<Grid xs>
					<Slider
						value={typeof value === 'number' ? value : 0}
						onChange={(_, val) => onChange(val as number)}
						aria-labelledby={`input-slider-${label}`}
						min={range.min}
						max={range.max}
					/>
				</Grid>
				<Grid>
					<Input
						sx={{ width: '100px' }}
						value={value}
						onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
						onBlur={(_) => onChange(clamp(value, range.min, range.max))}
						endDecorator={endDecorator}
						type={'number'}
					/>
				</Grid>
			</Grid>
		</Box>
	);
}
