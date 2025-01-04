import { IconButton, Stack, Typography } from '@mui/joy';
import { ServiceFileSystem } from './ServiceFileSystem';
import { useSelector } from 'react-redux';
import { FileSystemTrunk } from '../tree/FileSystemTrunk';
import { selectServices } from '@/state/active/selectors';
import { useAppDispatch } from '@/state/store';
import { selectFilteredNestedIds } from '@/state/ui/selectors';
import { uiActions } from '@/state/ui/slice';
import { SearchField } from '@/components/shared/input/SearchField';
import { SideDrawerHeader } from '../../SideDrawerHeader';
import { collapseAll, expandAll } from '@/state/ui/thunks';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { AddBox } from '@mui/icons-material';
import { menuOptionCollapseAll, menuOptionExpandAll } from '../tree/FileSystemDropdown';

export function ServicesFileSystem() {
	const services = useSelector(selectServices);
	const serviceIdsUnfiltered = Object.values(services).map((srv) => srv.id);
	const serviceIds = useSelector((state) => selectFilteredNestedIds(state, serviceIdsUnfiltered));
	const dispatch = useAppDispatch();

	return (
		<>
			<SideDrawerHeader
				content="Services"
				menuOptions={[
					menuOptionCollapseAll(() => dispatch(collapseAll(Object.keys(services))), 'Services'),
					menuOptionExpandAll(() => dispatch(expandAll(Object.keys(services))), 'Services'),
				]}
				actions={
					<Stack flexWrap="wrap" direction="row" justifyContent="end" alignItems="center" gap={1}>
						<SearchField onChange={(text) => dispatch(uiActions.setSearchText(text))} />
						<SprocketTooltip text="Add New Service">
							<IconButton onClick={() => dispatch(uiActions.addToCreateQueue('service'))}>
								<AddBox />
							</IconButton>
						</SprocketTooltip>
					</Stack>
				}
			/>
			{serviceIds.length === 0 && (
				<Typography textAlign="center" sx={{ width: '100%', mt: 4 }}>
					No services found.
				</Typography>
			)}
			<FileSystemTrunk>
				{serviceIds.map((serviceId) => (
					<ServiceFileSystem key={serviceId} serviceId={serviceId} />
				))}
			</FileSystemTrunk>
		</>
	);
}
