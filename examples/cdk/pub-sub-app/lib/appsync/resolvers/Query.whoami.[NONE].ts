import { util, Context, NONERequest, AppSyncIdentityCognito } from '@aws-appsync/utils';

export function request(ctx: Context): NONERequest {
	let me = 'anonymous';

	if (util.authType() === 'User Pool Authorization') {
		me = (ctx.identity as AppSyncIdentityCognito).username;
	}

	return { payload: me };
}

export const response = (ctx: Context) => ctx.result;
