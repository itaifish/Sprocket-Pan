import { Box, Card, CardContent, Link, useTheme } from '@mui/joy';

interface NewWorkspaceCardProps {
	onCreate: () => void;
}

export function NewWorkspaceCard({ onCreate }: NewWorkspaceCardProps) {
	const theme = useTheme();
	return (
		<Card
			sx={{
				minWidth: 400,
				minHeight: 200,
				'--Card-radius': (theme) => theme.vars.radius.xs,
				'&:hover': {
					cursor: 'pointer',
					backgroundColor: `${theme.palette.background.level1}`,
				},
			}}
		>
			<CardContent>
				<Link overlay underline="none" href="#interactive-card" onClick={onCreate}></Link>
				<Box sx={{ display: 'block', mx: 'auto' }}>
					<Box
						sx={{
							borderRadius: '50%',
							width: '150px',
							height: '150px',
							backgroundColor: `rgba(${theme.palette.primary.darkChannel})`,
						}}
					>
						<Box
							sx={{
								position: 'relative',
								backgroundColor: '#FFFFFF',
								width: '50%',
								height: '12.5%',
								left: '25%',
								top: '43.75%',
							}}
						></Box>
						<Box
							sx={{
								position: 'relative',
								backgroundColor: '#FFFFFF',
								height: '50%',
								width: '12.5%',
								top: '12.5%',
								left: '43.75%',
							}}
						>
							{' '}
							<Link overlay underline="none" href="#interactive-card" onClick={onCreate}></Link>
						</Box>
					</Box>
				</Box>
			</CardContent>
		</Card>
	);
}
