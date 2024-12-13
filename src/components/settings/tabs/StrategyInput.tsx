import { Chip, Sheet } from '@mui/joy';
import { ScriptChips } from '../ScriptChips';
import { tabTypeIcon } from '@/constants/components';
import { Settings } from '@/types/data/settings';

type Strategy = Settings['script']['strategy'];

export interface StrategyInputProps {
	onChange: (strategy: Strategy) => void;
	value: Strategy;
}

export function StrategyInput({ value, onChange }: StrategyInputProps) {
	return (
		<Sheet variant="outlined" color="neutral" sx={{ padding: 4 }}>
			<ScriptChips prefix="pre" setStrategy={(pre) => onChange({ pre, post: value.post })} strategy={value.pre} />
			<Chip sx={{ verticalAlign: 'middle' }} color="primary" startDecorator={tabTypeIcon.request}>
				Request
			</Chip>
			<ScriptChips prefix="post" setStrategy={(post) => onChange({ post, pre: value.pre })} strategy={value.post} />
		</Sheet>
	);
}
