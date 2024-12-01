import { Stack } from '@mui/joy';
import { PropsWithChildren } from 'react';

export interface ActionBarProps extends PropsWithChildren {
	start?: React.ReactNode;
	end?: React.ReactNode;
}

export type ActionBarPassthroughProps = Omit<ActionBarProps, 'children'> & { middle?: ActionBarProps['children'] };

export function ActionBar({ start, children, end }: ActionBarProps) {
	return (
		<Stack direction="row" justifyContent="stretch" alignItems="end" flexWrap="nowrap" gap={2}>
			<Stack direction="row" justifyContent="start" alignItems="end" width="25%">
				{start}
			</Stack>
			<Stack direction="row" justifyContent="center" alignItems="end" minWidth="fit-content" width="100%">
				{children}
			</Stack>
			<Stack direction="row" justifyContent="end" alignItems="end" width="25%">
				{end}
			</Stack>
		</Stack>
	);
}
