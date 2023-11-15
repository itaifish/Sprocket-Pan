import * as React from 'react';

import { Box, Grid, Input, Slider, Typography } from '@mui/joy';
import { clamp } from '../../../utils/math';

type InputSliderProps = {
	label: string;
	value: number;
	setValue: (val: number) => void;
	endDecorator?: React.ReactNode;
	icon: React.ReactNode;
	range: {
		min: number;
		max: number;
	};
};

export function InputSlider({ label, value, setValue, endDecorator, icon, range }: InputSliderProps) {
	const handleSliderChange = (_event: Event, newValue: number | number[]) => {
		setValue(newValue as number);
	};

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValue(event.target.value === '' ? 0 : Number(event.target.value));
	};

	const handleBlur = () => {
		setValue(clamp(value, range.min, range.max));
	};

	return (
		<Box sx={{ width: 250 }}>
			<Typography id={`input-slider-${label}`} gutterBottom>
				{label}
			</Typography>
			<Grid container spacing={2} alignItems="center">
				<Grid>{icon}</Grid>
				<Grid xs>
					<Slider
						value={typeof value === 'number' ? value : 0}
						onChange={handleSliderChange}
						aria-labelledby={`input-slider-${label}`}
						min={range.min}
						max={range.max}
					/>
				</Grid>
				<Grid>
					<Input
						sx={{ width: '100px' }}
						value={value}
						onChange={handleInputChange}
						onBlur={(_event) => handleBlur?.()}
						endDecorator={endDecorator}
						type={'number'}
					/>
				</Grid>
			</Grid>
		</Box>
	);
}
