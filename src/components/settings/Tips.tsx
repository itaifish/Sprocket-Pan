/* eslint-disable react/jsx-key */
// disabling jsx-key because we don't need keys for single items picked from an array
import { Chip, Divider, Stack, Typography } from '@mui/joy';
import { COMMAND } from '../../managers/ShortcutManager';
import { Keys } from '../shared/Keys';
import { A } from '../shared/Link';
import { selectActiveState } from '../../state/active/selectors';
import { useSelector } from 'react-redux';
import { PropsWithChildren } from 'react';

const DYK_LABEL = 'Did You Know?';

interface TipProps extends PropsWithChildren {
	label?: string;
}

function Tip({ children, label = 'Tip' }: TipProps) {
	return (
		<Stack direction="row" gap={1} divider={<Divider orientation="vertical" />}>
			<Stack minWidth={86} maxWidth={86} alignItems="end" justifyContent="center">
				<Chip size="sm">{label}</Chip>
			</Stack>
			<Typography overflow="hidden" maxHeight="3em" level="body-sm">
				{children}
			</Typography>
		</Stack>
	);
}

const TIPS: React.ReactNode[] = [
	<Tip>
		You can <Keys commands={[COMMAND.meta, COMMAND.click]} /> on underlined URLs to open them.
	</Tip>,
];

const DYKS: React.ReactNode[] = [
	<Tip label={DYK_LABEL}>
		PHP is a recursive acronym. It stands for{' '}
		<A href="https://www.php.net/manual/en/faq.general.php">PHP: Hypertext Preprocessor</A>.
	</Tip>,
	<Tip label={DYK_LABEL}>
		<code>{`"very.(),:;<>[]\".VERY.\"very@\\ \"very\".unusual"@strange.example.xyz`}</code> is a{' '}
		<A href="https://en.wikipedia.org/wiki/Email_address">valid email address</A>.
	</Tip>,
	<Tip label={DYK_LABEL}>
		SprocketPan is free to use and open source. You can read the license{' '}
		<A href="https://github.com/itaifish/Sprocket-Pan?tab=License-1-ov-file#readme">here</A>.
	</Tip>,
	<Tip label={DYK_LABEL}>
		There are over <A href="https://en.wikipedia.org/wiki/List_of_Internet_top-level_domains">1500 top-level domains</A>
		, from <code>.academy</code> to <code>.zone</code>.
	</Tip>,
];

const ALL = [...TIPS, ...DYKS];

export function Tips() {
	const lastSaved = useSelector(selectActiveState).lastSaved;
	const num = lastSaved % ALL.length;
	return ALL[num];
}
