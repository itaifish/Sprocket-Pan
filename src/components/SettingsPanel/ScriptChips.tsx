import { IconButton, Chip } from '@mui/joy';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { iconFromTabType } from '../../types/application-data/application-data';
import { SettingsTabProps } from './GeneralTab';

interface ScriptChipsProps extends SettingsTabProps {
	preOrPost: 'pre' | 'post';
}

export function ScriptChips({ preOrPost, settings, setSettings }: ScriptChipsProps) {
	const [parent] = useAutoAnimate();
	return (
		<span ref={parent}>
			{settings.scriptRunnerStrategy[preOrPost].map((strategyItem, index) => (
				<span key={`${preOrPost}${index}`}>
					{index !== 0 && (
						<IconButton
							sx={{ verticalAlign: 'middle' }}
							size="sm"
							onClick={() => {
								const copy = structuredClone(settings.scriptRunnerStrategy[preOrPost]);
								const temp = copy[index];
								copy[index] = copy[index - 1];
								copy[index - 1] = temp;
								setSettings({ scriptRunnerStrategy: { ...settings.scriptRunnerStrategy, [preOrPost]: copy } });
							}}
						>
							<WestIcon />
						</IconButton>
					)}
					<Chip sx={{ verticalAlign: 'middle' }} startDecorator={iconFromTabType[strategyItem]}>
						{preOrPost}-{strategyItem}
					</Chip>
					{index !== 2 && (
						<IconButton
							size="sm"
							sx={{ verticalAlign: 'middle' }}
							onClick={() => {
								const copy = structuredClone(settings.scriptRunnerStrategy[preOrPost]);
								const temp = copy[index];
								copy[index] = copy[index + 1];
								copy[index + 1] = temp;
								setSettings({ scriptRunnerStrategy: { ...settings.scriptRunnerStrategy, [preOrPost]: copy } });
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
