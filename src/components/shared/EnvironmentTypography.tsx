import { Typography, TypographyProps } from '@mui/joy';
import { Snippet } from '../../managers/EnvironmentContextResolver';

interface EnvironmentTypographyProps {
	snippets: Snippet[];
	displayVariableNames?: boolean;
	typographyProps?: TypographyProps;
}

export function EnvironmentTypography({ snippets, displayVariableNames, typographyProps }: EnvironmentTypographyProps) {
	return (
		<Typography {...typographyProps}>
			{snippets.map((snippet, index) => {
				if (snippet.variableName) {
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
				} else {
					return snippet.value;
				}
			})}
		</Typography>
	);
}
