import { Stack, Box, useTheme } from '@mui/joy';
import { useAutosave } from './hooks/useAutosave';
import { TabHeader } from '../header/TabHeader';
import { SideDrawer } from '../sidebar/SideDrawer';
import { VerticalMenu } from '../sidebar/VerticalMenu';
import { ImperativePanelHandle, Panel, PanelGroup } from 'react-resizable-panels';
import { SprocketResizeHandle } from '../shared/SprocketResizeHandle';
import { SidebarTabs } from '../sidebar/types';
import { useRef, useState } from 'react';

interface WorkspaceProps {
	sizeOverride?: { width: string; height: string };
}

export function Workspace({ sizeOverride }: WorkspaceProps) {
	const [tab, setTab] = useState<SidebarTabs>(SidebarTabs.Workspaces);
	const theme = useTheme();
	const [expanded, setIsExpanded] = useState(false);
	const ref = useRef<ImperativePanelHandle>(null);
	const setPanelTab = (newTab: SidebarTabs) => {
		if (ref.current?.isCollapsed()) {
			ref.current?.expand();
		} else if (newTab === tab) {
			ref.current?.collapse();
		}
		setTab(newTab);
	};
	useAutosave();
	return (
		<Stack
			direction="row"
			sx={{
				height: sizeOverride ? sizeOverride.height : '100vh',
				width: sizeOverride ? sizeOverride.width : '100vw',
				minHeight: sizeOverride?.height ? '10%' : '100vh',
				maxWidth: sizeOverride?.width ? '100%' : '100vw',
				overflow: 'hidden',
				backgroundColor: theme.palette.background.level1,
			}}
		>
			<Box sx={{ flex: 0, minWidth: '45px', maxWidth: '45px', height: '100%' }}>
				<VerticalMenu tab={tab} setTab={setPanelTab} showActive={expanded} />
			</Box>
			<PanelGroup direction="horizontal">
				<Panel
					defaultSize={25}
					minSize={10}
					ref={ref}
					collapsible
					onCollapse={() => setIsExpanded(false)}
					onExpand={() => setIsExpanded(true)}
				>
					<SideDrawer tab={tab} />
				</Panel>
				<SprocketResizeHandle />
				<Panel defaultSize={75} minSize={50}>
					<TabHeader />
				</Panel>
			</PanelGroup>
		</Stack>
	);
}
