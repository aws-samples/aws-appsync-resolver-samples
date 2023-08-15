import { Context } from '@aws-appsync/utils';
import { search } from './utils';
import { Result, SearchQueryVariables, SearchableTodoConnection } from '../codegen';

export function request(ctx: Context<SearchQueryVariables>) {
	const { filter, limit, nextToken } = ctx.args;
	const match_all = JSON.stringify({ match_all: {} });
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const bq = !filter ? match_all : util.transform.toElasticsearchQueryDSL(filter as any);
	const body: Record<string, unknown> = { query: JSON.parse(bq) };
	if (nextToken) {
		body.search_after = JSON.parse(util.base64Decode(nextToken));
	}
	return search({
		index: 'todos',
		body,
		size: limit ?? 100,
		sort: 'id.keyword:asc',
	});
}

export function response(ctx: Context): Result<SearchableTodoConnection> {
	const body = JSON.parse(ctx.result.body);
	if (!`${ctx.result.statusCode}`.startsWith('2')) {
		util.error(body.error?.reason, body.error?.type, body);
	}
	let nextToken = null;
	const hits = body.hits.hits;
	if (hits.length > 0) {
		nextToken = util.base64Encode(JSON.stringify(hits[hits.length - 1].sort));
	}
	return {
		items: hits.map((hit: { _source: unknown }) => hit._source),
		total: body.hits.total.value,
		nextToken,
	};
}
