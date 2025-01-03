import { Box, Card, Sheet, useTheme } from '@mui/joy';
import { TrapezoidalHeader } from '../shared/flair/TrapezoidalHeader';
import { FileSystemDropdown, FileSystemMenuOption } from './file-system/tree/FileSystemDropdown';

export interface SideDrawerHeaderProps {
	content: string | React.ReactNode;
	actions?: React.ReactNode;
	menuOptions?: FileSystemMenuOption[];
}

export function SideDrawerHeader({ content, actions, menuOptions }: SideDrawerHeaderProps) {
	const theme = useTheme();
	return (
		<>
			<Sheet
				sx={{
					position: 'sticky',
					top: 0,
					width: '100%',
					zIndex: 120,
					mb: 1,
				}}
			>
				<TrapezoidalHeader sx={{ boxShadow: '0px 5px 20px 0px ' + theme.palette.background.surface }}>
					{content}
				</TrapezoidalHeader>
				{menuOptions != null && (
					<Box position="absolute" top="5px" right="1px">
						<FileSystemDropdown options={menuOptions} />
					</Box>
				)}
			</Sheet>
			{actions != null && (
				<Card sx={{ m: 1, mr: 0, p: 1.5 }} variant="soft">
					{actions}
				</Card>
			)}
		</>
	);
}
