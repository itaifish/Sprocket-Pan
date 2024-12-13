import { Service } from '@/types/data/workspace';

export interface SectionProps {
	data: Service;
	onChange: (data: Partial<Service>) => void;
}
