import { util, Context, extensions, AppSyncIdentityCognito, NONERequest } from '@aws-appsync/utils';
import { MSG_KIND, Message } from '../codegen';

export function request(ctx: Context): NONERequest {
	if (util.authType() === 'User Pool Authorization') {
		const identity = ctx.identity as AppSyncIdentityCognito;
		const filter = util.transform.toSubscriptionFilter<Message>({
			or: [{ to: { eq: identity.username } }, { kind: { eq: MSG_KIND.ALL } }],
		});
		extensions.setSubscriptionFilter(filter);
	} else {
		const filter = util.transform.toSubscriptionFilter<Message>({
			kind: { eq: MSG_KIND.ALL },
		});
		extensions.setSubscriptionFilter(filter);
	}
	return { payload: null };
}

export const response = (ctx: Context) => ctx.result;
