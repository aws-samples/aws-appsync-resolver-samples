import { Context, DynamoDBPutItemRequest, HTTPRequest, Key } from '@aws-appsync/utils';

/**
 * Checks for errors and returns the `result
 */
export function checkErrorsandRespond(ctx: Context) {
	if (ctx.error) {
		util.error(ctx.error.message, ctx.error.type);
	}
	return ctx.result;
}

type PutRequestType = {
	key: Key;
	values: Record<string, unknown>;
	condition: Record<string, unknown>;
};
/**
 * Helper function to create a new item
 * @returns a PutItem request
 */
export function dynamodbPutRequest({
	key,
	values,
	condition: inCondObj,
}: PutRequestType): DynamoDBPutItemRequest {
	const condition = JSON.parse(util.transform.toDynamoDBConditionExpression(inCondObj));
	if (condition.expressionValues && !Object.keys(condition.expressionValues).length) {
		delete condition.expressionValues;
	}
	return {
		operation: 'PutItem',
		key: util.dynamodb.toMapValues(key),
		attributeValues: util.dynamodb.toMapValues(values),
		condition,
	};
}

type UpdateRequestType = {
	key: Key;
	values: Record<string, unknown>;
	condition: Record<string, unknown>;
};
export function dynamodbUpdateRequest({ key, values, condition: inCondObj }: UpdateRequestType) {
	const sets: string[] = [];
	const removes: string[] = [];
	const expressionNames: Record<string, string> = {};
	const expValues: Record<string, unknown> = {};

	for (const [k, v] of Object.entries(values)) {
		expressionNames[`#${k}`] = k;
		if (v) {
			sets.push(`#${k} = :${k}`);
			expValues[`:${k}`] = v;
		} else {
			removes.push(`#${k}`);
		}
	}

	console.log(`SET: ${sets.length}, REMOVE: ${removes.length}`);

	let expression = sets.length ? `SET ${sets.join(', ')}` : '';
	expression += removes.length ? ` REMOVE ${removes.join(', ')}` : '';

	console.log('update expression', expression);

	const condition = JSON.parse(util.transform.toDynamoDBConditionExpression(inCondObj));

	if (condition.expressionValues && !Object.keys(condition.expressionValues).length) {
		delete condition.expressionValues;
	}

	return {
		operation: 'UpdateItem',
		key: util.dynamodb.toMapValues(key),
		condition,
		update: {
			expression,
			expressionNames,
			expressionValues: util.dynamodb.toMapValues(expValues),
		},
	};
}

export function aossCreateIndex(index: string, options: FetchOptions) {
	if (!options.headers) {
		options.headers = {};
	}
	options.headers['content-type'] = 'application/json';
	return fetch(`/${index}`, options);
}

export function aossIndexApi<T>(params: Index<T>) {
	if (params.body == null) {
		util.error('Missing required parameter: body');
	}
	const headers = { 'content-type': 'application/json' };

	const type = '_doc';
	const { body, id, index, ...query } = params;
	const path = '/' + util.urlEncode(index) + '/' + util.urlEncode(type) + '/' + util.urlEncode(id!);

	return fetch(path, { method: 'PUT', body, query, headers });
}

export function aossSearch<T>(params: Search<T>) {
	if (params.body == null) {
		util.error('Missing required parameter: body');
	}
	const headers = { 'content-type': 'application/json' };

	const { body, index, ...query } = params;
	let path = '/_search';
	if (index != null) {
		path = '/' + util.urlEncode(index) + '/' + '_search';
	} else {
		path = '/' + '_search';
	}

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

export interface Search<T = RequestBody> {
	index?: string | string[];
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
	const { method = 'GET', headers, body: _body, query = {} } = options;
	// const [path, params] = resourcePath.split('?');
	// console.log('params > ', params);
	// if (params && params.length) {
	// 	params.split('&').forEach((param) => {
	// 		console.log('param > ', param);
	// 		const [key, value] = param.split('=');
	// 		query[key] = value;
	// 	});
	// }
	const body = JSON.stringify(_body);
	return {
		resourcePath,
		method,
		params: { headers, query, body },
		version: '2018-05-29',
	};
}

// export function snakeCaseKeys(
// 	acceptedQuerystring: string[],
// 	snakeCase: Record<string, string>,
// 	querystring: Record<string, string>
// ) {
// 	const target: Record<string, string> = {};
// 	const keys = Object.keys(querystring);
// 	keys.forEach((key) => {
// 		target[snakeCase[key] || key] = querystring[key];
// 	});
// 	return target;
// }

// const acceptedQuerystring = [
// 	'cluster_manager_timeout',
// 	'timeout',
// 	'master_timeout',
// 	'ignore_unavailable',
// 	'allow_no_indices',
// 	'expand_wildcards',
// 	'pretty',
// 	'human',
// 	'error_trace',
// 	'source',
// 	'filter_path',
// 	'index',
// 	'fielddata',
// 	'fields',
// 	'query',
// 	'request',
// 	'wait_for_active_shards',
// 	'run_expensive_tasks',
// 	'flush',
// 	'local',
// 	'flat_settings',
// 	'include_defaults',
// 	'force',
// 	'wait_if_ongoing',
// 	'max_num_segments',
// 	'only_expunge_deletes',
// 	'create',
// 	'cause',
// 	'write_index_only',
// 	'preserve_existing',
// 	'order',
// 	'detailed',
// 	'active_only',
// 	'dry_run',
// 	'verbose',
// 	'status',
// 	'copy_settings',
// 	'completion_fields',
// 	'fielddata_fields',
// 	'groups',
// 	'level',
// 	'types',
// 	'include_segment_file_sizes',
// 	'include_unloaded_segments',
// 	'forbid_closed_indices',
// 	'wait_for_completion',
// 	'only_ancient_segments',
// 	'explain',
// 	'q',
// 	'analyzer',
// 	'analyze_wildcard',
// 	'default_operator',
// 	'df',
// 	'lenient',
// 	'rewrite',
// 	'all_shards',
// ];
// const snakeCase = {
// 	clusterManagerTimeout: 'cluster_manager_timeout',
// 	masterTimeout: 'master_timeout',
// 	ignoreUnavailable: 'ignore_unavailable',
// 	allowNoIndices: 'allow_no_indices',
// 	expandWildcards: 'expand_wildcards',
// 	errorTrace: 'error_trace',
// 	filterPath: 'filter_path',
// 	waitForActiveShards: 'wait_for_active_shards',
// 	runExpensiveTasks: 'run_expensive_tasks',
// 	flatSettings: 'flat_settings',
// 	includeDefaults: 'include_defaults',
// 	waitIfOngoing: 'wait_if_ongoing',
// 	maxNumSegments: 'max_num_segments',
// 	onlyExpungeDeletes: 'only_expunge_deletes',
// 	writeIndexOnly: 'write_index_only',
// 	preserveExisting: 'preserve_existing',
// 	activeOnly: 'active_only',
// 	dryRun: 'dry_run',
// 	copySettings: 'copy_settings',
// 	completionFields: 'completion_fields',
// 	fielddataFields: 'fielddata_fields',
// 	includeSegmentFileSizes: 'include_segment_file_sizes',
// 	includeUnloadedSegments: 'include_unloaded_segments',
// 	forbidClosedIndices: 'forbid_closed_indices',
// 	waitForCompletion: 'wait_for_completion',
// 	onlyAncientSegments: 'only_ancient_segments',
// 	analyzeWildcard: 'analyze_wildcard',
// 	defaultOperator: 'default_operator',
// 	allShards: 'all_shards',
// };
