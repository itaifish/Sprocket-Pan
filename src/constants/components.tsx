import TableChartIcon from '@mui/icons-material/TableChart';
import FolderOpenSharpIcon from '@mui/icons-material/FolderOpenSharp';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import CodeIcon from '@mui/icons-material/Code';
import KeyIcon from '@mui/icons-material/Key';
import { TabType } from '@/types/state/state';

export const tabTypeIcon: Record<TabType, JSX.Element> = {
	endpoint: <FolderOpenIcon />,
	environment: <TableChartIcon />,
	request: <TextSnippetIcon />,
	service: <FolderOpenSharpIcon />,
	script: <CodeIcon />,
	secrets: <KeyIcon />,
};
