import { v4 } from 'uuid';
import { Request as RequestV2, Url as UrlV2 } from './parseTypes/postman2.0Types';
import { Url as UrlV21, Request as RequestV21 } from './parseTypes/postman2.1Types';
import { Body, Header, Item, postmanParseManager } from './postman/PostmanParseManager';
import yaml from 'js-yaml';
import { readTextFile } from '@tauri-apps/api/fs';
import { log } from '@/utils/logging';

type InsomniaCollection = any;
type Url = UrlV2 | UrlV21;
type Request = RequestV2 | RequestV21;

// Lots of this code borrowed from https://github.com/Vyoam/InsomniaToPostmanFormat/blob/main/convertJsonFile.js

class InsomniaParseManager {
	public static readonly INSTANCE = new InsomniaParseManager();

	private constructor() {}

	public async parseInsomniaFile(inputType: 'fileContents' | 'filePath', inputValue: string) {
		try {
			const loadedFile = await this.loadInsomniaFile(inputType, inputValue);
			const input = this.importInsomniaCollection(this.parseInsomniaInput(loadedFile));
			return input;
		} catch (e) {
			log.error(e);
			return Promise.reject(e);
		}
	}

	private parseInsomniaInput(input: string) {
		return yaml.load(input);
	}

	private async loadInsomniaFile(inputType: 'fileContents' | 'filePath', inputValue: string): Promise<string> {
		if (inputType === 'fileContents') {
			return inputValue;
		}
		return await readTextFile(inputValue);
	}

	private importInsomniaCollection(collection: InsomniaCollection) {
		if (collection.__export_format !== 4) {
			log.error(
				'Error: Version (__export_format ' +
					collection.__export_format +
					') not supported. Only version 4 is supported.',
			);
			return null;
		}
		const outputData = {
			info: {
				_postman_id: '',
				name: '',
				schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
			},
			item: [],
		} as any;
		outputData.info._postman_id = v4();
		const rootId = v4();
		const maps = this.generateMapsForPostman(collection.resources, rootId);
		const parentChildrenMap = maps[0];
		const subItems = this.getSubItemTrees(parentChildrenMap, rootId);
		outputData.item.push(...subItems);
		return postmanParseManager.importPostmanCollection(outputData, 'Insomnia');
	}

	private transformUrlToPostman(insomniaUrl: string) {
		if (insomniaUrl === '') return {};
		const postmanUrl: Url = {};
		postmanUrl.raw = insomniaUrl;
		const urlParts = insomniaUrl.split(/\:\/\//);
		let rawHostAndPath;
		if (urlParts.length === 1) {
			rawHostAndPath = urlParts[0];
		} else if (urlParts.length === 2) {
			postmanUrl.protocol = urlParts[0];
			rawHostAndPath = urlParts[1];
		} else {
			console.error('Error: Unexpected number of components found in the URL string. Exiting.');
			process.exit(3);
		}
		// https://stackoverflow.com/questions/4607745/split-string-only-on-first-instance-of-specified-character
		const hostAndPath = rawHostAndPath.split(/\/(.+)/);
		postmanUrl.host = hostAndPath[0].split(/\./);
		postmanUrl.path = hostAndPath[1] === undefined ? [] : hostAndPath[1].split(/\//);
		return postmanUrl;
	}

	private transformHeadersToPostman(insomniaHeaders: { name: string; value: string }[]) {
		const outputHeaders: Header[] = [];
		insomniaHeaders.forEach((element) => {
			outputHeaders.push({ key: element.name, value: element.value });
		});
		return outputHeaders;
	}

	private transformBodyToPostman(insomniaBody: any) {
		const body: Body = {};
		switch (insomniaBody.mimeType) {
			case '':
			case 'application/json':
			case 'application/xml':
				body.mode = 'raw';
				body.raw = insomniaBody.text;
				break;
			case 'multipart/form-data':
				body.mode = 'formdata';
				body.formdata = [];
				insomniaBody.params.forEach((param: any) => {
					body.formdata!.push({ key: param.name, value: param.value });
				});
				break;
			case 'application/x-www-form-urlencoded':
				body.mode = 'urlencoded';
				body.urlencoded = [];
				insomniaBody.params.forEach((param: any) => {
					body.urlencoded!.push({ key: param.name, value: param.value });
				});
				break;
			case 'application/octet-stream':
				body.mode = 'file';
				body.file = {};
				body.file.src = '/C:/PleaseSelectAFile';
				log.warn(
					'Warning: A file is supposed to be a part of the request!!! Would need to be manually selected in Postman.',
				);
				break;
			case 'application/graphql':
				const graphqlBody = JSON.parse(insomniaBody.text);
				body.mode = 'graphql';
				body.graphql = {};
				body.graphql.query = graphqlBody.query;
				body.graphql.variables = JSON.stringify(graphqlBody.variables);
				break;
			default:
				log.warn('Warning: Body type unsupported; skipped!!! ... ' + insomniaBody.mimeType);
				body.mode = 'raw';
				body.raw = 'InsomniaToPostmanFormat: Unsupported body type ' + insomniaBody.mimeType;
				break;
		}
		return body;
	}

	private transformItemToPostman(insomniaItem: any) {
		const postmanItem: Item = {} as Item;
		postmanItem.name = insomniaItem.name;
		const request: Request = {};
		request.description = insomniaItem.description as string;
		request.method = insomniaItem.method;
		request.header = this.transformHeadersToPostman(insomniaItem.headers);
		if (Object.keys(insomniaItem.body).length !== 0) {
			request.body = this.transformBodyToPostman(insomniaItem.body);
		}
		request.url = this.transformUrlToPostman(insomniaItem.url);
		if (insomniaItem.parameters && insomniaItem.parameters.length > 0) {
			if (request.url.raw !== undefined && request.url.raw.includes('?')) {
				console.warn(
					"Warning: Query params detected in both the raw query and the 'parameters' object of Insomnia request!!! Exported Postman collection may need manual editing for erroneous '?' in url.",
				);
			}
			request.url.query = [];
			insomniaItem.parameters.forEach((param: any) => {
				(request.url as any).query!.push({ key: param.name, value: param.value });
			});
		}
		request.auth = {} as any; // todo
		if (Object.keys(insomniaItem.authentication).length !== 0) {
			log.warn('Warning: Auth param export not yet supported!!!');
		}
		postmanItem.request = request;
		postmanItem.response = [];
		return postmanItem;
	}

	private generateMapsForPostman(insomniaParentChildList: any, rootId: string) {
		const parentChildrenMap = new Map();
		const flatMap = new Map();
		insomniaParentChildList.forEach((element: any) => {
			flatMap.set(element._id, element);
			let elementArray: any;
			switch (element._type) {
				case 'workspace':
					// 'bug': only one workspace to be selected (the last one which comes up here)
					elementArray = [];
					elementArray.push(element);
					parentChildrenMap.set(rootId, elementArray); // in any case will select the top workspace when creating tree
					break;
				case 'request':
					elementArray = parentChildrenMap.get(element.parentId);
					if (elementArray === undefined) elementArray = [];
					elementArray.push(element);
					parentChildrenMap.set(element.parentId, elementArray);
					break;
				case 'request_group':
					elementArray = parentChildrenMap.get(element.parentId);
					if (elementArray === undefined) elementArray = [];
					elementArray.push(element);
					parentChildrenMap.set(element.parentId, elementArray);
					break;
				default:
					log.warn('Warning: Item type unsupported; skipped!!! ... ' + element._type);
			}
		});
		const maps = [parentChildrenMap, flatMap];
		return maps;
	}

	private generateTreeRecursivelyForPostman(element: any, parentChildrenMap: any) {
		let postmanItem = {} as any;
		switch (element._type) {
			case 'request_group':
				postmanItem.name = element.name;
				postmanItem.item = [];
				parentChildrenMap.get(element._id).forEach((child: any) => {
					postmanItem.item.push(this.generateTreeRecursivelyForPostman(child, parentChildrenMap));
				});
				break;
			case 'request':
				postmanItem = this.transformItemToPostman(element);
				break;
			default:
				console.warn('Warning: Item type unsupported; skipped!!! ... ' + element._type);
		}
		return postmanItem;
	}

	private getSubItemTrees(parentChildrenMap: any, rootId: string) {
		const subItemTrees: any[] = [];
		const roots = parentChildrenMap.get(rootId);
		parentChildrenMap.get(roots[0]._id).forEach((element: any) => {
			subItemTrees.push(this.generateTreeRecursivelyForPostman(element, parentChildrenMap));
		});
		return subItemTrees;
	}
}

export const insomniaParseManager = InsomniaParseManager.INSTANCE;
