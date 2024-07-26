import { TabType } from '../types/state/state';

export type TabsType = { tabs: Record<string, TabType>; selected: string | null };
