module.exports.handler = async (event) => {
	const posts = [
		{
			id: '1',
			title: 'Post One',
		},
		{
			id: '2',
			title: 'Post Two',
		},
		{
			id: '3',
			title: 'Post Three',
		},
		{
			id: '4',
			title: 'Post Four',
		},
		{
			id: '5',
			title: 'Post Five',
		},
	];

	if (event.field === 'getPost') {
		return posts.find((post) => post.id === event.arguments.id);
	} else {
		return posts;
	}
};
