exports.handler = async (event, context, callback) => {
	console.log('Received event {}', JSON.stringify(event, 3));
	var posts = {
		1: {
			id: '1',
			title: 'First book',
		},
		2: {
			id: '2',
			title: 'Second book',
		},
		3: {
			id: '3',
			title: 'Third book',
		},
		4: {
			id: '4',
			title: 'Fourth book',
		},
		5: {
			id: '5',
			title: 'Fifth book',
		},
	};

	console.log('Got an Invoke Request.');
	switch (event.field) {
		case 'getPost':
			var id = event.arguments.id;
			return posts[id];
			break;
		case 'listsPosts':
			return posts;
			break;
		default:
			callback('Unknown field, unable to resolve' + event.field, null);
			break;
	}
};
