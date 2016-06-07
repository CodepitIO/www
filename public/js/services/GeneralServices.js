angular.module('General')
  .service('TimeState', [
    '$interval',
    '$resource',
    'RequestAPI',
    function ($interval, $resource, request) {
      var diff = 0, now
      var $scope = this

      $scope.server = {
        dynamic: new Date(),
        static: new Date()
      }

      $interval(function () {
        now = (new Date()).getTime()
        $scope.server.dynamic = new Date(now + diff)
      }, 5000)

      var GetServerTimeAPI = $resource('/api/v1/server/time', {})
      request.send('get', GetServerTimeAPI)({}).then(function (data) {
        var serverDate = new Date(data.date)
        var clientDate = new Date()

        diff = Math.max(0, serverDate - clientDate)
        now = (new Date()).getTime()
        $scope.server.dynamic = $scope.server.static = new Date(now + diff)
      })
    }
  ])
  .service('HistoryState', [
    '$rootScope',
    '$state',
    '$location',
    function ($rootScope, $state, $location) {
      var $scope = this
      var history = []
      var lastState = ''

      $scope.push = function (ev, to, toParams, from, fromParams) {
        if (from.name === '' || to.name === lastState) return
        lastState = ''
        history.push({state: from.name, params: fromParams, url: $location.url()})
      }

      $scope.pop = function() {
        if (_.isEmpty(history)) return null
        var last = _.last(history)
        lastState = last.state
        $state.go(last.state, last.params || {})
        history.pop()
        return last
      }

      $scope.isEmpty = function() {
        return _.isEmpty(history)
      }
    }
  ])
  .service('SocketState', [
    function() {
      var $scope = this
      var socket = io.connect()
      var room

      $scope.join = function(newRoom) {
        socket.emit('join', {
          previous: room,
          current: newRoom
        })
        room = newRoom
        console.log('Vai trocar!')
      }
      $scope.join('blabla')
    }
  ])