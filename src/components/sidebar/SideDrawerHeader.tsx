import { Box, Card, Sheet, Typography, useTheme } from '@mui/joy';
import { FileSystemDropdown, FileSystemMenuOption } from './file-system/FileSystemDropdown';

export interface SideDrawerHeaderProps {
	content: string | React.ReactNode;
	actions?: React.ReactNode;
	menuOptions?: FileSystemMenuOption[];
}

export function SideDrawerHeader({ content, actions, menuOptions }: SideDrawerHeaderProps) {
	const theme = useTheme();
	return (
		<>
			<Box
				sx={{
					position: 'sticky',
					top: 0,
					width: '100%',
					zIndex: 120,
					mb: 1,
				}}
			>
				<Sheet
					color="primary"
					variant="soft"
					sx={{
						maxWidth: '225px',
						p: 1,
						// 110% and 33px to allow the box shadow to show while still preserving the angle
						clipPath: 'polygon(0 0, 100% 0, calc(100% - 33px) 110%, 0 110%)',
						boxShadow: '0px 5px 20px 0px ' + theme.palette.background.surface,
					}}
				>
					<Typography ml={2}>{content}</Typography>
				</Sheet>
				{menuOptions != null && (
					<Box position="absolute" top="5px" right="2px">
						<FileSystemDropdown options={menuOptions} />
					</Box>
				)}
			</Box>
			{actions != null && (
				<Card sx={{ m: 1, mr: 0, p: 1.5 }} variant="soft">
					{actions}
				</Card>
			)}
		</>
	);
}
