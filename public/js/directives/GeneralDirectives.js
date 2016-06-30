var app = angular.module('General')

app.directive('mrtConfirmClick', [
  '$mdDialog',
  function ($mdDialog) {
    return {
      link: function (scope, element, attr) {
        var title = attr.mrtConfirmClickTitle || 'Você tem certeza?'
        var descr = attr.mrtConfirmClickDescr || ''
        element.bind('click', function(ev) {
          var confirm = $mdDialog.confirm()
          .title(title)
          .textContent(descr)
          .clickOutsideToClose(true)
          .targetEvent(ev)
          .ok('Sim')
          .cancel('Não');
          $mdDialog.show(confirm).then(function() {
            scope.$eval(attr.mrtConfirmClick)
          });
        })
      }
    }
  }
])

app.directive('mrtBreadcrumbs', function () {
  return {
    restrict: 'E',
    scope: {
      title: '=',
      location: '='
    },
    templateUrl: 'views/misc/breadcrumbs.html'
  }
})

app.directive('mrtMatchField', [function () {
  return {
    require: 'ngModel',
    link: function ($scope, $elem, $attrs, ngModel) {
      var validate = function (value) {
        var comparisonModel = $attrs.mrtMatchField
        if (comparisonModel != value) {
          ngModel.$setValidity('mrtMatchField', false)
          return value
        }
        ngModel.$setValidity('mrtMatchField', true)
        return value
      }

      $attrs.$observe('mrtMatchField', function (comparisonModel) {
        return validate(ngModel.$viewValue)
      })

      ngModel.$parsers.unshift(function (value) {
        return validate(value)
      })
      ngModel.$formatters.unshift(function (value) {
        return validate(value)
      })
    }
  }
}])

app.directive('tooltip', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      $(element).hover(function () {
        $(element).tooltip('show')
      }, function () {
        $(element).tooltip('hide')
      })
    }
  }
})

app.directive('mrtLoadingSpinner', function () {
  return {
    restrict: 'E',
    scope: {
      diameter: '='
    },
    templateUrl: 'views/misc/loading-spinner.html'
  }
})

app.directive('mrtPageWrapper', function () {
  return {
    restrict: 'E',
    transclude: true,
    scope: {
      waitFor: '=?',
      waitWhile: '=?',
      color: '=?',
      diameter: '=?',
    },
    templateUrl: 'views/misc/page-wrapper.html',
    controller: ['$scope', function ($scope) {
      $scope.color = angular.isDefined($scope.color) ? $scope.color : '#45a7b9'
      $scope.diameter = angular.isDefined($scope.diameter) ? $scope.diameter : '280'
      $scope.waitFor = angular.isDefined($scope.waitFor) ? $scope.waitFor : true
      $scope.waitWhile = angular.isDefined($scope.waitWhile) ? $scope.waitWhile : false
    }]
  }
})

app.directive('mrtDisplayTime', function () {
  return {
    restrict: 'E',
    scope: {
      date: '='
    },
    template: '<a target="_blank" ' +
      'href="http://www.timeanddate.com/worldclock/fixedtime.html?day={{date.getUTCDate()}}' +
      '&month={{date.getUTCMonth()+1}}&year={{date.getUTCFullYear()}}&' +
      'hour={{date.getUTCHours()}}&min={{date.getUTCMinutes()}}&sec={{date.getUTCSeconds()}}">' +
      "<span>{{date | amUtc | amLocal | amDateFormat:'ddd, D/MMM/YYYY, HH:mm'}}</span>" +
      "<sup>UTC{{date | amUtc | amLocal | amDateFormat:'Z' | mrtTimezoneStrap}}</sup></a>",
    controller: [
      '$scope',
      function ($scope) {
        $scope.date = new Date($scope.date)
      }
    ]
  }
})

app.directive('mrtLoginForm', [function () {
  return {
    restrict: 'E',
    templateUrl: 'views/user/login-form.html',
    controller: 'LoginController'
  }
}])

app.directive('mrtBlogPosts', [function () {
  return {
    restrict: 'E',
    templateUrl: 'views/misc/blog-posts.html',
    scope: {
      user: '=?',
      pagePath: '=?',
      isInfo: '=?'
    },
    controller: [
      '$scope',
      '$state',
      '$stateParams',
      '$mdDialog',
      '$mdMedia',
      'PostAPI',
      function ($scope, $state, $stateParams, $mdDialog, $mdMedia, PostAPI) {
        $scope.user = $scope.user

        $scope.page = {
          current: $stateParams.page || 1,
          maxDisplay: 10,
          total: 0,
          posts: []
        }

        $scope.loading = true
        function fetchPosts () {
          $scope.loading = true
          PostAPI.get($scope.user, $scope.pagePath, function (err, posts) {
            $scope.page.posts = posts
            $scope.loading = false
          })
        }

        PostAPI.count($scope.user, $scope.pagePath, function (err, count) {
          $scope.page.total = count
          fetchPosts()
        })

        $scope.changePage = function () {
          $state.go('.', { page: $scope.page.current}, { notify: false })
          fetchPosts()
        }

        $scope.editPost = function (data) {
          $mdDialog.show({
            controller: 'ProfilePostsDialogController',
            locals: { ScopeData: data },
            templateUrl: 'views/user/profile.posts.dialog.html',
            clickOutsideToClose: true,
            fullscreen: ($mdMedia('sm') || $mdMedia('xs'))
          })
        }
      }
    ]
  }
}])

app.directive('mrtGoBack', [
  'HistoryState',
  function (HistoryState) {
  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {
      if (HistoryState.isEmpty()) return elem.hide()
      elem.bind('click', HistoryState.pop)
    },
  }
}])

app.directive('mrtContestProgress', function () {
  return {
    restrict: 'E',
    scope: {
      startTime: '=',
      frozenTime: '=',
      blindTime: '=',
      endTime: '=',
      hasFrozen: '=',
      hasBlind: '=',
      previewBar: '=?'
    },
    templateUrl: 'views/misc/contest-progress.html',
    controller: [
      '$scope',
      'TimeState',
      'formatDurationFilter',
      function($scope, TimeState, formatDurationFilter) {
        var getWidths = _.throttle(function() {
          var total = ($scope.endTime - $scope.startTime)
          if (!$scope.hasBlind) $scope.blindTime = $scope.endTime
          if (!$scope.hasFrozen) $scope.frozenTime = $scope.blindTime
          var frozen = Math.floor(($scope.endTime - $scope.frozenTime) * 100 / total)
          var blind = Math.floor(($scope.endTime - $scope.blindTime) * 100 / total)
          return {
            frozen: frozen,
            blind: blind
          }
        }, 1000)

        $scope.getWidthOf = function(type) { return getWidths()[type] }
        $scope.getPercentage = function() {
          return Math.floor((TimeState.server.now - $scope.startTime) * 100 /
            ($scope.endTime - $scope.startTime))
        }
        $scope.getClass = function() {
          var now = TimeState.server.now
          if ($scope.hasBlind && now >= $scope.blindTime) return 'md-warn'
          if ($scope.hasFrozen && now >= $scope.frozenTime) return 'md-accent'
          return 'md-primary'
        }
        $scope.showBar = function(type) {
          var now = TimeState.server.now
          if (type === 'frozen') {
            if (!$scope.hasFrozen) return false
            return now < $scope.frozenTime
          }
          if (type === 'blind') {
            if (!$scope.hasBlind) return false
            return now < $scope.blindTime
          }
        }

        $scope.getUptime = function() {
          var time = formatDurationFilter(Math.floor((TimeState.server.now - $scope.startTime) / 1000), true)
          if (TimeState.server.now < $scope.startTime) time += ' para começar'
          return time
        }
        $scope.getTimeLeft = function() {
          var time = formatDurationFilter(Math.floor(($scope.endTime - TimeState.server.now) / 1000), true)
          return time
        }
        $scope.getTotalTime = function() {
          var time = formatDurationFilter(Math.floor(($scope.endTime - $scope.startTime) / 1000), true)
          return time
        }

        $scope.isContestRunning = function() {
          var now = TimeState.server.now
          return now >= $scope.startTime && now < $scope.endTime
        }
        $scope.hasContestEnded = function() {
          return TimeState.server.now >= $scope.endTime
        }
      }
    ],
  }
})
