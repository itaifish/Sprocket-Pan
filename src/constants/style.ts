import { RESTfulRequestVerb } from '@/types/data/shared';

export const verbColors: Record<RESTfulRequestVerb, string> = {
	GET: '#3366ff',
	POST: '#00802b',
	DELETE: '#cc0000',
	PUT: '#cca000',
	PATCH: '#cca000',
	OPTIONS: '#808080',
	HEAD: '#808080',
};
