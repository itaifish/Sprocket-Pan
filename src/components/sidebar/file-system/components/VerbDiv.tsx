import { verbColors } from '@/constants/style';

interface VerbDivProps {
	verb: keyof typeof verbColors;
}

export function VerbDiv({ verb }: VerbDivProps) {
	const color = verbColors[verb];
	return (
		<div
			style={{
				padding: '3px',
				color: color,
				borderRadius: '5px',
				border: '1px solid ' + color,
				fontSize: '0.75em',
				fontWeight: 600,
			}}
		>
			{verb}
		</div>
	);
}
