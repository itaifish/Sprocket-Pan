import { open } from '@tauri-apps/api/dialog';
import { Box, Dropdown, IconButton, ListItemDecorator, Menu, MenuButton } from '@mui/joy';
import { useRef, useState } from 'react';
import { DropdownMenuItem } from '@/components/shared/DropdownMenuItem';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { useClickOutsideAlerter } from '@/hooks/useClickOutsideAlerter';
import { WorkspaceDataManager } from '@/managers/data/WorkspaceDataManager';
import { useAppDispatch } from '@/state/store';
import { OpenApi } from '@/assets/icons/brands/OpenApi';
import { Postman } from '@/assets/icons/brands/Postman';
import { Insomnia } from '@/assets/icons/brands/Insomnia';
import { SprocketPan } from '@/assets/icons/brands/SprocketPan';
import { FluentImport } from '@/assets/icons/fluent/FluentImport';
import { activeActions } from '@/state/active/slice';

export function ImportFromFileButton() {
	const dispatch = useAppDispatch();
	const [menuOpen, setMenuOpen] = useState(false);
	const ref = useRef<HTMLInputElement>(null);
	useClickOutsideAlerter({ ref, onOutsideClick: () => setMenuOpen(false) });
	return (
		<SprocketTooltip text="Import From File" disabled={menuOpen}>
			<Box>
				<Dropdown open={menuOpen} onOpenChange={(_event, isOpen) => setMenuOpen(isOpen)}>
					<MenuButton
						slots={{ root: IconButton }}
						slotProps={{ root: { variant: 'soft', color: 'neutral', size: 'sm' } }}
					>
						<FluentImport />
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
									const data = WorkspaceDataManager.loadSprocketFile(selectedUrl);
									dispatch(activeActions.injectState(data));
								}
							}}
						>
							<ListItemDecorator>
								<IconButton aria-label="Import from Sprocketpan Workspace" color="primary">
									<SprocketPan />
								</IconButton>
							</ListItemDecorator>
							Sprocketpan Workspace
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
									const data = WorkspaceDataManager.loadSwaggerFile(selectedUrl);
									dispatch(activeActions.injectState(data));
								}
							}}
						>
							<ListItemDecorator>
								<IconButton aria-label="Import from Swagger/OpenAPI" color="primary">
									<OpenApi />
								</IconButton>
							</ListItemDecorator>
							Swagger/OpenAPI
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
									const data = WorkspaceDataManager.loadPostmanFile(selectedUrl);
									dispatch(activeActions.injectState(data));
								}
							}}
						>
							<ListItemDecorator>
								<IconButton aria-label="Import from Postman" color="primary">
									<Postman />
								</IconButton>
							</ListItemDecorator>
							Postman Collection
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
									const data = WorkspaceDataManager.loadInsomniaFile(selectedUrl);
									dispatch(activeActions.injectState(data));
								}
							}}
						>
							<ListItemDecorator>
								<IconButton aria-label="Import from Insomnia Collection" color="primary">
									<Insomnia />
								</IconButton>
							</ListItemDecorator>
							Insomnia Collection
						</DropdownMenuItem>
					</Menu>
				</Dropdown>
			</Box>
		</SprocketTooltip>
	);
}
