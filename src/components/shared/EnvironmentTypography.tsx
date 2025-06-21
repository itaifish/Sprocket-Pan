import { Typography, TypographyProps } from '@mui/joy';
import { useSelector } from 'react-redux';
import { SprocketTooltip } from './SprocketTooltip';
import { Snippet } from '@/managers/EnvironmentContextResolver';
import { selectSettings } from '@/state/active/selectors';
import { VariableNameDisplay } from '@/types/data/settings';

interface EnvironmentTypographyProps {
	snippets: Snippet[];
	displayVariableNames?: VariableNameDisplay;
	typographyProps?: TypographyProps;
}

export function EnvironmentTypography({ snippets, displayVariableNames, typographyProps }: EnvironmentTypographyProps) {
	const settings = useSelector(selectSettings);
	const displaySetting = displayVariableNames ?? settings.interface.variableNameDisplay;
	const shouldDisplayVariableNames = displaySetting === VariableNameDisplay.before;
	const shouldHoverVariableNames = displaySetting === VariableNameDisplay.hover;
	return (
		<Typography {...typographyProps}>
			{snippets.map((snippet, index) => {
				if (snippet.variableName == null) {
					return <span key={index}>{snippet.value}</span>;
				}
				const valueText = snippet.value ?? 'unknown';
				const shouldDisplayVariable = shouldDisplayVariableNames || snippet.value == null;
				const displayText = shouldDisplayVariable ? `${snippet.variableName}: ${valueText}` : valueText;
				return (
					<SprocketTooltip
						key={index}
						text={snippet.variableName}
						disabled={!shouldHoverVariableNames || snippet.value == null}
					>
						<Typography
							component="span"
							variant="outlined"
							color={snippet.value == null ? 'danger' : 'success'}
							sx={{ overflowWrap: 'break-word' }}
						>
							{displayText}
						</Typography>
					</SprocketTooltip>
				);
			})}
		</Typography>
	);
}
