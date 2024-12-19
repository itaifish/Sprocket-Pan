/* eslint-disable react/jsx-key */
// disabling jsx-key because we don't need keys for single items picked from an array
import { COMMAND } from '@/managers/ShortcutManager';
import { TIPS_SECTION } from '@/types/data/settings';
import { Box, Chip, Stack, Typography } from '@mui/joy';
import { PropsWithChildren } from 'react';
import { Keys } from '../shared/Keys';
import { A } from '../shared/Link';

const DYK_LABEL = 'Did You Know?';

interface TipProps extends PropsWithChildren {
	label?: string;
}

function Tip({ children, label = 'Tip' }: TipProps) {
	return (
		<Stack direction="row" gap={1}>
			<Chip size="sm">{label}</Chip>
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
	<Tip>
		An endpoint&apos;s default request can be accessed via the <code>Jump to Request</code> button.
	</Tip>,
	<Tip>
		Global settings are the baseline settings for all workspaces. Workspace-level settings that override global ones are
		marked with a globe icon.
	</Tip>,
	<Tip>
		SprocketPan is free to use and open source. You can read the license{' '}
		<A href="https://github.com/itaifish/Sprocket-Pan?tab=License-1-ov-file#readme">here</A>.
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
		There are over <A href="https://en.wikipedia.org/wiki/List_of_Internet_top-level_domains">1500 top-level domains</A>
		, from <code>.academy</code> to <code>.zone</code>.
	</Tip>,
];

const ALL = [...TIPS, ...DYKS];

const MESSAGES = {
	[TIPS_SECTION.all]: ALL,
	[TIPS_SECTION.dyk]: DYKS,
	[TIPS_SECTION.tips]: TIPS,
} as const;

interface TipsSection {
	variant: TIPS_SECTION;
	timestamp: number;
}

export function TipsSection({ variant, timestamp }: TipsSection) {
	if (variant === TIPS_SECTION.hidden) return <Box />;
	const messages = MESSAGES[variant];
	const num = timestamp % messages.length;
	return messages[num];
}
