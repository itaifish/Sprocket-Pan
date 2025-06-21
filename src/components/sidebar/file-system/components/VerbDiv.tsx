import { verbColors } from '@/constants/style';

interface VerbDivProps {
	verb?: keyof typeof verbColors;
}

export function VerbDiv({ verb = 'N/A' }: VerbDivProps) {
	const { color } = verbColors[verb];
	return (
		<div
			style={{
				color,
				fontSize: '1em',
				fontWeight: 600,
			}}
		>
			<code>{verb}</code>
		</div>
	);
}
