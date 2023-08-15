import { util, Context, NONERequest, AppSyncIdentityCognito } from '@aws-appsync/utils';
import { MSG_KIND, Message, PublishMutationVariables, Result } from '../codegen';

export function request(ctx: Context<PublishMutationVariables>): NONERequest {
	const { text, kind, to } = ctx.args.input;
	let from = 'anonymous';

	if (util.authType() === 'User Pool Authorization') {
		from = (ctx.identity as AppSyncIdentityCognito).username;
	} else {
		if (kind === MSG_KIND.DIRECT) {
			util.error('Anonymous user cannot send direct messages', 'ApplicationError');
		}
	}

	if (kind === MSG_KIND.ALL && to) {
		util.error(`Cannot specify 'to' in an 'ALL' message`, 'ApplicationError');
	}
	const msg: Result<Message> = {
		id: util.autoId(),
		createdAt: util.time.nowISO8601(),
		kind,
		text,
		from,
		to,
	};

	return { payload: msg };
}

export const response = (ctx: Context) => ctx.result;
