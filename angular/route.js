 app.config(function($stateProvider, $urlRouterProvider){
      $stateProvider
          .state('home', {
            url: '/home',
            templateUrl: 'templates/home/home.html',
            controller : 'abaca'
         })
         .state('confirm-booking', {
            url: '/home/confirm',
            templateUrl: 'templates/home/confirm.html',
            controller : 'confirm',
            params: {data: null}
         })

      $urlRouterProvider.otherwise('/home');
});