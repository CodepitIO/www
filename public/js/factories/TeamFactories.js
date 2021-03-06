angular.module('Team')
  .factory('TeamAPI', function ($resource, $state, Request, Notification, UserState) {
      var API = {
        create: Request.send('save', $resource('/api/v1/team/create')),
        edit: Request.send('save', $resource('/api/v1/team/:id/edit', { id: '@id' })),
        leave: Request.send('save', $resource('/api/v1/team/:id/leave', { id: '@id' })),
        invite: Request.send('save', $resource('/api/v1/team/:id/invite', { id: '@id' })),
        remove: Request.send('save', $resource('/api/v1/team/:id/remove', { id: '@id' })),
        accept: Request.send('save', $resource('/api/v1/team/:id/accept', { id: '@id' })),
        decline: Request.send('save', $resource('/api/v1/team/:id/decline', { id: '@id' })),
        get: Request.send('get', $resource('/api/v1/team/:id')),
      };
      return {
        create: function(name, callback) {
          name = name || '';
          if (name.length < 1 || name.length > 50) {
            return Notification.info('O nome do time deve ter entre 1 e 50 caracteres.');
          }
          API.create({name: name}).then(function(data) {
            $state.go('team', {id: data.team._id});
          });
        },
        edit: function(team, callback) {
          API.edit(team).then(function(data) {
            return callback && callback();
          });
        },
        leave: function(teamId, callback) {
          API.leave({id: teamId}).then(function(data) {
            $state.go('profile.teams', {id: UserState.getId()});
          });
        },
        invite: function(teamId, invitedEmail, callback) {
          API.invite({id: teamId, invited: invitedEmail}).then(function(data) {
            return callback && callback(null, data.invited);
          });
        },
        remove: function(teamId, removedId, callback) {
          API.remove({id: teamId, removed: removedId}).then(function(data) {
            if (removedId === UserState.getId()) {
              return $state.go('profile.teams', {id: UserState.getId()});
            } else {
              return callback && callback();
            }
          });
        },
        accept: function(teamId, callback) {
          API.accept({id: teamId}).then(function(data) {
            return callback && callback();
          });
        },
        decline: function(teamId, callback) {
          API.decline({id: teamId}).then(function(data) {
            return callback && callback();
          });
        },
        get: function(teamId, callback) {
          API.get({id: teamId}).then(function(data) {
            return callback && callback(null, data.team);
          });
        }
      };
    });
