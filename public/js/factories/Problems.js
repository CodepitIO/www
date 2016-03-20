angular.module('Problems').factory('ProblemsFactory', [
	'$http',
	'$resource',
	'$q',
	'RequestAPI',
	function($http, $resource, $q, global) {
		var FetchProblemsAPI = $resource('/api/problems/fetch', {
			regex: '@regex',
			problems: '@problems'
		});
		return {
			fetch: global.post.bind(null, FetchProblemsAPI),
		};
	}
]);
