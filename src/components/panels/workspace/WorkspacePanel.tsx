import { Box, IconButton, Stack, Typography } from '@mui/joy';
import { PanelProps } from '../panels.interface';
import { useSelector } from 'react-redux';
import { itemActions } from '@/state/items';
import { EditableHeader } from '../shared/EditableHeader';
import { globalActions } from '@/state/global/slice';
import { useAppDispatch } from '@/state/store';
import { WorkspaceMetadata } from '@/types/data/workspace';
import { Minidenticon } from '@/components/shared/Minidenticon';
import { EditableTextArea } from '@/components/shared/input/EditableTextArea';
import { Refresh } from '@mui/icons-material';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { EditableText } from '@/components/shared/input/EditableText';
import { generateSlug } from 'random-word-slugs';
import { SprocketTable } from '@/components/shared/SprocketTable';
import { RelativeTimeChip } from '@/components/shared/RelativeTimeChip';

export function WorkspacePanel({ id }: PanelProps) {
	const workspace = useSelector((state) => itemActions.workspace.select(state, id));
	const dispatch = useAppDispatch();
	if (workspace == null) {
		throw new Error(`${id} could not be found`);
	}

	const update = (val: Partial<WorkspaceMetadata>) => {
		dispatch(globalActions.updateWorkspace({ ...workspace, ...val }));
	};

	return (
		<Stack p={2} gap={2}>
			<EditableHeader value={workspace.name} onChange={(name) => update({ name })} />
			<Stack direction="row" gap={3} width="100%" justifyContent="stretch" flexWrap="wrap">
				<Box width="50%" minWidth="400px" flex={1}>
					<EditableTextArea text={workspace.description} setText={(description: string) => update({ description })} />
				</Box>
				<Box width="50%" minWidth="400px" flex={1}>
					<SprocketTable
						borderAxis="bothBetween"
						columns={[{ key: 'title', style: { width: 175 } }, { key: 'value' }]}
						data={[
							{
								key: 'minidenticon',
								title: <Typography>Identicon</Typography>,
								value: (
									<Stack
										direction="row"
										gap={2}
										alignItems="stretch"
										justifyContent="stretch"
										flexWrap="wrap"
										width="100%"
									>
										<Box minWidth="90px" width="90px">
											<Minidenticon username={workspace.minidenticon} />
										</Box>
										<EditableText text={workspace.minidenticon} setText={(minidenticon) => update({ minidenticon })} />
										<SprocketTooltip text="Randomize Icon" sx={{ position: 'absolute', right: '25px' }}>
											<IconButton onClick={() => update({ minidenticon: generateSlug(3) })}>
												<Refresh />
											</IconButton>
										</SprocketTooltip>
									</Stack>
								),
							},
							{
								key: 'modified',
								title: <Typography>Last Modified</Typography>,
								value: <RelativeTimeChip date={workspace.lastModified} />,
							},
							{
								key: 'fileName',
								title: <Typography>Folder Name</Typography>,
								value: <code>{workspace.fileName}</code>,
							},
						]}
					/>
				</Box>
			</Stack>
		</Stack>
	);
}
