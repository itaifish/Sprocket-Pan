import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { open } from '@tauri-apps/api/dialog';
import { Avatar, Box, Dropdown, IconButton, ListItemDecorator, Menu, MenuButton, MenuItem } from '@mui/joy';
import { applicationDataManager } from '../../../managers/ApplicationDataManager';
import { InjectLoadedData } from '../../../state/active/thunks/applicationData';
import { useAppDispatch } from '../../../state/store';
import { SprocketTooltip } from '../../shared/SprocketTooltip';
import { useEffect, useRef, useState } from 'react';
import OpenApiIcon from '../../../assets/buttonIcons/openapi.svg';
import PostmanIcon from '../../../assets/buttonIcons/postman.svg';
import { useOutsideAlerter } from '../../../hooks/useClickOutsideAlerter';

export function ImportFromFileButton() {
	const dispatch = useAppDispatch();
	const [menuOpen, setMenuOpen] = useState(false);
	const ref = useRef(null);
	const emitterForOutsideClicks = useOutsideAlerter(ref as any);
	useEffect(() => {
		emitterForOutsideClicks.addListener('outsideClick', () => {
			setMenuOpen(false);
		});
	}, [emitterForOutsideClicks]);
	return (
		<SprocketTooltip text="Import From File" disabled={menuOpen}>
			<Box>
				<Dropdown open={menuOpen} onOpenChange={(_event, isOpen) => setMenuOpen(isOpen)}>
					<MenuButton
						slots={{ root: IconButton }}
						slotProps={{ root: { variant: 'soft', color: 'neutral', size: 'sm' } }}
					>
						<CreateNewFolderIcon />
					</MenuButton>
					<Menu ref={ref}>
						<MenuItem
							onClick={async () => {
								const selectedUrl = await open({
									filters: [
										{ name: 'Swagger/OpenAPI File', extensions: ['yaml', 'json', 'yml'] },
										{ name: 'All Files', extensions: ['*'] },
									],
								});
								if (selectedUrl && typeof selectedUrl === 'string') {
									const loadedData = await applicationDataManager.loadSwaggerFile(selectedUrl);
									dispatch(InjectLoadedData(loadedData));
								}
							}}
						>
							<ListItemDecorator>
								<IconButton aria-label={`Import from Swagger/OpenAPI`} size="sm" color="primary">
									<Avatar src={OpenApiIcon} size="sm" />
								</IconButton>
								Import from Swagger/OpenAPI
							</ListItemDecorator>
						</MenuItem>
						<MenuItem
							onClick={async () => {
								const selectedUrl = await open({
									filters: [
										{ name: 'Postman Collection', extensions: ['json'] },
										{ name: 'All Files', extensions: ['*'] },
									],
								});
								if (selectedUrl && typeof selectedUrl === 'string') {
									const loadedData = await applicationDataManager.loadPostmanFile(selectedUrl);
									dispatch(InjectLoadedData(loadedData));
								}
							}}
						>
							<ListItemDecorator>
								<IconButton aria-label={`Import from Postman`} size="sm" color="primary">
									<Avatar src={PostmanIcon} size="sm" />
								</IconButton>
								Import from Postman Collection
							</ListItemDecorator>
						</MenuItem>
					</Menu>
				</Dropdown>
			</Box>
		</SprocketTooltip>
	);
}
