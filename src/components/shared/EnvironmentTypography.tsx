import { Typography, TypographyProps } from '@mui/joy';
import { Snippet } from '../../managers/EnvironmentContextResolver';
import { selectSettings } from '../../state/active/selectors';
import { useSelector } from 'react-redux';
import { VARIABLE_NAME_DISPLAY } from '../../types/settings/settings';

interface EnvironmentTypographyProps {
	snippets: Snippet[];
	displayVariableNames?: VARIABLE_NAME_DISPLAY;
	typographyProps?: TypographyProps;
}

export function EnvironmentTypography({ snippets, displayVariableNames, typographyProps }: EnvironmentTypographyProps) {
	const settings = useSelector(selectSettings);
	const shouldDisplayVariableNames =
		(displayVariableNames ?? settings.interface.variableNameDisplay) === VARIABLE_NAME_DISPLAY.before;
	return (
		<Typography {...typographyProps}>
			{snippets.map((snippet, index) => {
				if (snippet.variableName == null) return snippet.value;
				const valueText = snippet.value ?? 'unknown';
				const shouldDisplayVariable = shouldDisplayVariableNames || snippet.value == null;
				const displayText = shouldDisplayVariable ? `${snippet.variableName}: ${valueText}` : valueText;
				return (
					<Typography
						variant="outlined"
						color={snippet.value ? 'success' : 'danger'}
						key={index}
						sx={{ overflowWrap: 'break-word' }}
					>
						{displayText}
					</Typography>
				);
			})}
		</Typography>
	);
}
