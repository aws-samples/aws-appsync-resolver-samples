import { execSync } from 'child_process';
import { argv } from 'node:process';
import { program } from 'commander';
import { readFileSync } from 'fs';

program
	.argument('<resolver>')
	.option('-f, --fn <function>', 'the function to evaluate', 'request')
	.option('-c, --context <context-file>', 'your context')
	.option('-d, --debug', 'debug mode')
	.action((resolver, { fn = 'request', context, debug }) => {
		try {
			const ctx = !context ? '{}' : `file://${context}`;
			const RUNTIME = 'name=APPSYNC_JS,runtimeVersion=1.0.0';
			const _fn =
				fn === 'req' || fn === 'request'
					? 'request'
					: fn === 'res' || fn === 'response'
					? 'response'
					: 'unknown';

			if (_fn === 'unknown') {
				console.error('unknown `fn` value: ', fn);
				return;
			}
			const buffer = execSync(
				`aws appsync evaluate-code --code file://${resolver} --context ${ctx} --function ${_fn} --runtime ${RUNTIME}`
			);
			const json = JSON.parse(buffer.toString());
			if (debug) {
				console.debug(json);
			}
			if (json.error) {
				console.log('\x1b[31m');
				console.log('Error');
				console.log('-----\n');
				console.error(json.error.message);
				if (json.error.codeErrors) {
					console.log(json.error.codeErrors);
				}
				console.log('\x1b[0m');
				return;
			}
			console.log();
			console.log('\x1b[7mResult\x1b[0m');
			console.log('------\n');
			const b = execSync(`echo '${json.evaluationResult}' | jq`, { stdio: 'inherit' });
			console.log();
			console.log('\x1b[7mLogs\x1b[0m');
			console.log('----\n');
			json.logs.forEach((l) => console.log(l));
			console.log();
			// console.log(JSON.stringify(JSON.parse(buffer.toString()).evaluationResult, null, 2))
		} catch (error) {
			if (debug && buffer) {
				console.debug(buffer.toString());
			}
			console.error(error.message);
		}
	});
program.parse();
