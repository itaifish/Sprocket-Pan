import { SprocketPan } from '@/assets/icons/brands/SprocketPan';
import { open } from '@tauri-apps/api/dialog';
import { WorkspaceDataManager } from '@/managers/data/WorkspaceDataManager';
import { activeActions } from '@/state/active/slice';
import { useAppDispatch } from '@/state/store';
import { WorkspaceData } from '@/types/data/workspace';
import { Box, Button, Stack, Typography } from '@mui/joy';
import { useState } from 'react';
import { SprocketModal, SprocketModalProps } from '@/components/shared/modals/SprocketModal';
import { useSelector } from 'react-redux';
import { selectActiveWorkspace } from '@/state/global/selectors';
import { InlineItemName } from '@/components/shared/InlineItemName';
import { joinList } from '@/utils/string';

const options = [
	{
		label: 'SprocketPan',
		parser: WorkspaceDataManager.loadSprocketFile,
		Icon: SprocketPan,
		filter: { name: 'Sprocketpan Workspace', extensions: ['json'] },
	},
];

const desiredKeys: (keyof WorkspaceData)[] = [
	'services',
	'endpoints',
	'environments',
	'requests',
	'scripts',
	'secrets',
] as const;

export function ImportSelector(props: Pick<SprocketModalProps, 'open' | 'onClose'>) {
	const [data, setData] = useState<Partial<WorkspaceData> | null>(null);
	const selectedWorkspace = useSelector(selectActiveWorkspace);
	const dispatch = useAppDispatch();

	const infoStr =
		data != null &&
		joinList(
			desiredKeys
				.map((key) => ({ key, length: data[key] == null ? 0 : Object.keys(data[key]).length }))
				.filter(({ length }) => length > 0)
				.map(({ key, length }) => `${length} ${key}`),
		);

	const apply = () => {
		if (data != null) {
			dispatch(activeActions.injectState(data));
			props.onClose?.();
			setData(null);
		}
	};

	return (
		<SprocketModal
			{...props}
			title="Import From File"
			actions={
				<Button disabled={data == null} onClick={apply}>
					Apply
				</Button>
			}
		>
			<Box>
				<Stack direction="row">
					{options.map(({ Icon, label, filter, parser }) => (
						<Stack
							component="button"
							width="150px"
							height="150px"
							alignItems="center"
							justifyContent="center"
							gap={2}
							key={label}
							onClick={async () => {
								const selectedUrl = await open({
									filters: [filter, { name: 'All Files', extensions: ['*'] }],
								});
								if (selectedUrl && typeof selectedUrl === 'string') {
									setData(await parser(selectedUrl));
								}
							}}
						>
							<Icon color="primary" />
							{label}
						</Stack>
					))}
				</Stack>
				{data != null && (
					<Typography>
						Importing {infoStr} into workspace <InlineItemName item={selectedWorkspace} />.
					</Typography>
				)}
			</Box>
		</SprocketModal>
	);
}
