import { verbColors } from '@/constants/style';

interface VerbDivProps {
	verb?: keyof typeof verbColors;
}

export function VerbDiv({ verb = 'N/A' }: VerbDivProps) {
	const { color, backgroundColor } = verbColors[verb];
	return (
		<div
			style={{
				padding: '3px',
				color,
				borderRadius: '10px',
				border: '1px solid ' + color,
				backgroundColor,
				fontSize: '0.75em',
				fontWeight: 600,
			}}
		>
			{verb}
		</div>
	);
}
