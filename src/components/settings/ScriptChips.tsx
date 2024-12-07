import { IconButton, Chip } from '@mui/joy';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { iconFromTabType } from '../../types/application-data/application-data';
import { ScriptRunnerStrategy } from '../../types/settings/settings';

interface ScriptChipsProps {
	strategy: ScriptRunnerStrategy;
	setStrategy: (strategy: ScriptRunnerStrategy) => void;
}

export function ScriptChips({ strategy, setStrategy }: ScriptChipsProps) {
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
					<Chip sx={{ verticalAlign: 'middle' }} startDecorator={iconFromTabType[strategyItem]}>
						{'preOrPost'}-{strategyItem}
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
