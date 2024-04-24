import { util } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';

export function request(ctx) {
	// Without ddb util
	//
	// return {
	//   operation: "PutItem",
	//   key: {
	//     id: {
	//       S: util.autoId(),
	//     },
	//   },
	//   attributeValues: {
	//     title: {
	//       S: ctx.arguments.input.title,
	//     },
	//     completed: {
	//       BOOL: ctx.arguments.input.completed,
	//     },
	//   },
	// };

	return ddb.put({
		key: {
			id: util.autoId(),
		},
		item: ctx.arguments.input,
	});
}

export function response(ctx) {
	return ctx.result;
}
