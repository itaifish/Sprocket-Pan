import { WorkspaceData } from '@/types/data/workspace';

export type Parser = (content: string) => Promise<Partial<WorkspaceData>> | Partial<WorkspaceData>;
