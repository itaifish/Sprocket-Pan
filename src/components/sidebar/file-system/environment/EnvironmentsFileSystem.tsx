import { IconButton, ListDivider, Stack, Typography } from '@mui/joy';
import { EnvironmentFileSystem } from './EnvironmentFileSystem';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectEnvironments } from '@/state/active/selectors';
import { searchEnvironments } from '@/utils/search';
import { FileSystemTrunk } from '../tree/FileSystemTrunk';
import { SearchField } from '@/components/shared/input/SearchField';
import { OpenSecretsButton } from '../../buttons/OpenSecretsButton';
import { SideDrawerHeader } from '../../SideDrawerHeader';
import { AddBox } from '@mui/icons-material';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { uiActions } from '@/state/ui/slice';
import { useAppDispatch } from '@/state/store';
import { ItemType } from '@/types/data/item';

export function EnvironmentsFileSystem() {
	const environments = useSelector(selectEnvironments);
	const [searchText, setSearchText] = useState('');
	const dispatch = useAppDispatch();

	const filteredEnvironmentIds = useMemo(
		() => searchEnvironments(environments, searchText),
		[environments, searchText],
	);

	return (
		<>
			<SideDrawerHeader
				content="Environments"
				actions={
					<Stack flexWrap="wrap" direction="row" justifyContent="end" alignItems="center" gap={1}>
						<SearchField onChange={setSearchText} />
						<Stack direction="row">
							<OpenSecretsButton />
							<SprocketTooltip text="Add New Environment">
								<IconButton onClick={() => dispatch(uiActions.addToCreateQueue(ItemType.environment))}>
									<AddBox />
								</IconButton>
							</SprocketTooltip>
						</Stack>
					</Stack>
				}
			/>
			{filteredEnvironmentIds.length === 0 && (
				<Typography textAlign="center" sx={{ width: '100%', mt: 4 }}>
					No environments found.
				</Typography>
			)}
			<FileSystemTrunk
				items={filteredEnvironmentIds}
				render={(id, index) => (
					<>
						{index !== 0 && <ListDivider />}
						<EnvironmentFileSystem environmentId={id} />
					</>
				)}
			/>
		</>
	);
}
