import { Typography, TypographyProps } from '@mui/joy';
import { Snippet } from '../../managers/EnvironmentContextResolver';
import { selectSettings } from '../../state/active/selectors';
import { useSelector } from 'react-redux';

interface EnvironmentTypographyProps {
	snippets: Snippet[];
	displayVariableNames?: boolean;
	typographyProps?: TypographyProps;
}

export function EnvironmentTypography({ snippets, displayVariableNames, typographyProps }: EnvironmentTypographyProps) {
	const settings = useSelector(selectSettings);
	displayVariableNames = displayVariableNames ?? settings.displayVariableNames;
	return (
		<Typography {...typographyProps}>
			{snippets.map((snippet, index) => {
				if (snippet.variableName == null) return snippet.value;
				const valueText = snippet.value ?? 'unknown';
				const shouldDisplayVariable = displayVariableNames || snippet.value == null;
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
