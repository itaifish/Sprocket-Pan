import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { open } from '@tauri-apps/api/dialog';
import { Avatar, Box, Dropdown, IconButton, ListItemDecorator, Menu, MenuButton, useColorScheme } from '@mui/joy';
import { WorkspaceDataManager } from '../../../managers/data/WorkspaceDataManager';
import { InjectLoadedData } from '../../../state/active/thunks/applicationData';
import { useAppDispatch } from '../../../state/store';
import { SprocketTooltip } from '../../shared/SprocketTooltip';
import { useEffect, useRef, useState } from 'react';
import OpenApiIcon from '../../../assets/buttonIcons/openapi.svg';
import PostmanIcon from '../../../assets/buttonIcons/postman.svg';
import InsomniaIcon from '../../../assets/buttonIcons/insomnia.svg';
import SprocketIconDark from '../../../assets/logo.svg';
import SprocketIconLight from '../../../assets/logo-light.svg';

import { useClickOutsideAlerter } from '../../../hooks/useClickOutsideAlerter';
import { readTextFile } from '@tauri-apps/api/fs';
import { WorkspaceData } from '../../../types/application-data/application-data';
import { DropdownMenuItem } from '../../shared/DropdownMenuItem';

export function ImportFromFileButton() {
	const dispatch = useAppDispatch();
	const [menuOpen, setMenuOpen] = useState(false);
	const ref = useRef(null);
	const emitterForOutsideClicks = useClickOutsideAlerter(ref as any);
	useEffect(() => {
		emitterForOutsideClicks.addListener('outsideClick', () => {
			setMenuOpen(false);
		});
	}, [emitterForOutsideClicks]);
	const { systemMode } = useColorScheme();
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
						<DropdownMenuItem
							onClick={async () => {
								const selectedUrl = await open({
									filters: [
										{ name: 'Sprocketpan Workspace', extensions: ['json'] },
										{ name: 'All Files', extensions: ['*'] },
									],
								});
								if (selectedUrl && typeof selectedUrl === 'string') {
									const loadedDataString = await readTextFile(selectedUrl);
									const asData: Partial<WorkspaceData> = JSON.parse(loadedDataString);
									const toInject = {
										services: Object.values(asData.services ?? {}),
										endpoints: Object.values(asData.endpoints ?? {}),
										requests: Object.values(asData.requests ?? {}),
										environments: Object.values(asData.environments ?? {}),
										scripts: Object.values(asData.scripts ?? {}),
									};
									dispatch(InjectLoadedData(toInject));
								}
							}}
						>
							<ListItemDecorator>
								<IconButton aria-label={`Import from Sprocketpan`} size="sm" color="primary">
									<Avatar
										src={systemMode === 'dark' ? SprocketIconLight : SprocketIconDark}
										size="sm"
										color="primary"
									/>
								</IconButton>
								Import from Sprocketpan Workspace
							</ListItemDecorator>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={async () => {
								const selectedUrl = await open({
									filters: [
										{ name: 'Swagger/OpenAPI File', extensions: ['yaml', 'json', 'yml'] },
										{ name: 'All Files', extensions: ['*'] },
									],
								});
								if (selectedUrl && typeof selectedUrl === 'string') {
									const loadedData = await WorkspaceDataManager.loadSwaggerFile(selectedUrl);
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
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={async () => {
								const selectedUrl = await open({
									filters: [
										{ name: 'Postman Collection', extensions: ['json'] },
										{ name: 'All Files', extensions: ['*'] },
									],
								});
								if (selectedUrl && typeof selectedUrl === 'string') {
									const loadedData = await WorkspaceDataManager.loadPostmanFile(selectedUrl);
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
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={async () => {
								const selectedUrl = await open({
									filters: [
										{ name: 'Insomnia Collection', extensions: ['json', 'yml', 'yaml'] },
										{ name: 'All Files', extensions: ['*'] },
									],
								});
								if (selectedUrl && typeof selectedUrl === 'string') {
									const loadedData = await WorkspaceDataManager.loadInsomniaFile(selectedUrl);
									if (loadedData) {
										dispatch(InjectLoadedData(loadedData));
									}
								}
							}}
						>
							<ListItemDecorator>
								<IconButton aria-label={`Import from Insomnia`} size="sm" color="primary">
									<Avatar src={InsomniaIcon} size="sm" />
								</IconButton>
								Import from Insomnia Collection
							</ListItemDecorator>
						</DropdownMenuItem>
					</Menu>
				</Dropdown>
			</Box>
		</SprocketTooltip>
	);
}
