import { RESTfulRequestVerb } from '@/types/data/shared';
import { ColorPaletteProp, OptionPropsColorOverrides } from '@mui/joy';
import { OverridableStringUnion } from '@mui/types';

export const verbColors: Record<
	RESTfulRequestVerb,
	OverridableStringUnion<ColorPaletteProp, OptionPropsColorOverrides>
> = {
	GET: 'primary',
	POST: 'success',
	DELETE: 'danger',
	PUT: 'warning',
	PATCH: 'warning',
	OPTIONS: 'neutral',
	HEAD: 'neutral',
};
