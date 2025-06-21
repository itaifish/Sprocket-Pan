import { Stack, Box, useTheme } from '@mui/joy';
import { useAutosave } from './hooks/useAutosave';
import { TabHeader } from '../header/TabHeader';
import { SideDrawer } from '../sidebar/SideDrawer';
import { VerticalMenu } from '../sidebar/VerticalMenu';
import { ImperativePanelHandle, Panel, PanelGroup } from 'react-resizable-panels';
import { SprocketResizeHandle } from '../shared/SprocketResizeHandle';
import { SidebarTabs } from '../sidebar/types';
import { useRef, useState } from 'react';

export function Workspace() {
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
				height: '100vh',
				width: '100vw',
				minHeight: '100vh',
				maxWidth: '100vw',
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
