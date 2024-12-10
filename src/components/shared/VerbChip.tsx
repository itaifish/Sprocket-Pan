import { Chip } from '@mui/joy';
import { verbColors } from '../../constants/style';
import { RESTfulRequestVerb } from '../../types/application-data/application-data';

interface VerbChipProps {
	method: RESTfulRequestVerb;
}

export function VerbChip({ method }: VerbChipProps) {
	return (
		<Chip sx={{ minWidth: '75px' }} color={verbColors[method]}>
			{method}
		</Chip>
	);
}
