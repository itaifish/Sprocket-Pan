import { IconButton, Chip } from '@mui/joy';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { tabTypeIcon } from '@/constants/components';
import { ScriptRunnerStrategy } from '@/types/data/settings';

interface ScriptChipsProps {
	prefix: string;
	strategy: ScriptRunnerStrategy;
	setStrategy: (strategy: ScriptRunnerStrategy) => void;
}

export function ScriptChips({ prefix, strategy, setStrategy }: ScriptChipsProps) {
	const [parent] = useAutoAnimate();
	return (
		<span ref={parent}>
			{strategy.map((strategyItem, index) => (
				<span key={`${strategyItem}${index}`}>
					{index !== 0 && (
						<IconButton
							sx={{ verticalAlign: 'middle' }}
							size="sm"
							onClick={() => {
								const copy = structuredClone(strategy);
								const temp = copy[index];
								copy[index] = copy[index - 1];
								copy[index - 1] = temp;
								setStrategy(copy);
							}}
						>
							<WestIcon />
						</IconButton>
					)}
					<Chip sx={{ verticalAlign: 'middle' }} startDecorator={tabTypeIcon[strategyItem]}>
						{prefix}-{strategyItem}
					</Chip>
					{index !== 2 && (
						<IconButton
							size="sm"
							sx={{ verticalAlign: 'middle' }}
							onClick={() => {
								const copy = structuredClone(strategy);
								const temp = copy[index];
								copy[index] = copy[index + 1];
								copy[index + 1] = temp;
								setStrategy(copy);
							}}
						>
							<EastIcon />
						</IconButton>
					)}
				</span>
			))}
		</span>
	);
}
