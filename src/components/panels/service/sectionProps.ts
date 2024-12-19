import { Service } from '@/types/data/workspace';

export interface SectionProps {
	service: Service;
	onChange: (data: Partial<Service>) => void;
}
