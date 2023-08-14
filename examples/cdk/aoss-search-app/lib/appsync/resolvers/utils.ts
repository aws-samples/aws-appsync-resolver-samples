import { HTTPRequest } from '@aws-appsync/utils';

export function createIndex<T>(params: IndicesCreate<T>) {
	const headers = { 'content-type': 'application/json' };
	const { body, index, ...query } = params;
	const path = '/' + util.urlEncode(index);
	return fetch(path, { method: 'PUT', body, query, headers });
}

export function indexItem<T>(params: Index<T>) {
	const headers = { 'content-type': 'application/json' };
	const { body, index, id, ...query } = params;
	if (id === null) {
		util.error('Missing required parameter: id');
	}
	if (index == null) {
		util.error('Missing required parameter: index');
	}
	if (body == null) {
		util.error('Missing required parameter: body');
	}

	const path = '/' + util.urlEncode(index) + '/' + '_create' + '/' + util.urlEncode(id!);
	return fetch(path, { method: 'PUT', body, query, headers });
}

export function search<T>(params: Search<T>) {
	const headers = { 'content-type': 'application/json' };
	if (params.body == null) {
		util.error('Missing required parameter: body');
	}

	const { body, index, ...queryString } = params;
	let path = '/_search';
	if (index !== null) {
		path = '/' + util.urlEncode(index) + '/' + '_search';
	} else {
		path = '/' + '_search';
	}

	let query: Record<string, string> = {};
	Object.entries(queryString).forEach(([k, v]) => {
		query[k] = util.urlEncode(`${v}`);
	});

	return fetch(path, { method: 'POST', body, query, headers });
}

type RequestBody<T = Record<string, unknown>> = T;

export interface Index<T = RequestBody> {
	id?: string;
	index: string;
	wait_for_active_shards?: string;
	op_type?: 'index' | 'create';
	refresh?: 'wait_for' | boolean;
	routing?: string;
	timeout?: string;
	version?: number;
	version_type?: 'internal' | 'external' | 'external_gte';
	if_seq_no?: number;
	if_primary_term?: number;
	pipeline?: string;
	require_alias?: boolean;
	body: T;
}

export interface IndicesCreate<T = RequestBody> {
	index: string;
	wait_for_active_shards?: string;
	timeout?: string;
	cluster_manager_timeout?: string;
	body?: T;
}

export interface Search<T = RequestBody> {
	index: string;
	_source_exclude?: string | string[];
	_source_include?: string | string[];
	analyzer?: string;
	analyze_wildcard?: boolean;
	ccs_minimize_roundtrips?: boolean;
	default_operator?: 'AND' | 'OR';
	df?: string;
	explain?: boolean;
	stored_fields?: string | string[];
	docvalue_fields?: string | string[];
	from?: number;
	ignore_unavailable?: boolean;
	ignore_throttled?: boolean;
	allow_no_indices?: boolean;
	expand_wildcards?: 'open' | 'closed' | 'hidden' | 'none' | 'all';
	lenient?: boolean;
	preference?: string;
	q?: string;
	routing?: string | string[];
	scroll?: string;
	search_type?: 'query_then_fetch' | 'dfs_query_then_fetch';
	size?: number;
	sort?: string | string[];
	_source?: string | string[];
	_source_excludes?: string | string[];
	_source_includes?: string | string[];
	terminate_after?: number;
	stats?: string | string[];
	suggest_field?: string;
	suggest_mode?: 'missing' | 'popular' | 'always';
	suggest_size?: number;
	suggest_text?: string;
	timeout?: string;
	track_scores?: boolean;
	track_total_hits?: boolean;
	allow_partial_search_results?: boolean;
	typed_keys?: boolean;
	version?: boolean;
	seq_no_primary_term?: boolean;
	request_cache?: boolean;
	batched_reduce_size?: number;
	max_concurrent_shard_requests?: number;
	pre_filter_shard_size?: number;
	rest_total_hits_as_int?: boolean;
	min_compatible_shard_node?: string;
	body?: T;
}
export type FetchOptions = {
	method: 'PUT' | 'POST' | 'GET' | 'DELETE' | 'PATCH';
	headers?: Record<string, string>;
	body: unknown;
	query?: Record<string, string | boolean | number>;
};

/**
 * Sends an HTTP request
 */
export function fetch(resourcePath: string, options: FetchOptions): HTTPRequest {
	const { method = 'GET', headers, body, query } = options;
	let request: HTTPRequest = {
		resourcePath,
		method,
		params: { headers },
		// version: '2018-05-29',
	};

	if (body) {
		request.params!.body = JSON.stringify(body);
	}
	if (query) {
		request.params!.query = query;
	}

	return request;
}
