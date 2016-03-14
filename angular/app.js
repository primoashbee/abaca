var app = angular.module('abacaapp', ['ui.router']);

   app.filter('range', function() {
     return function(input, total) {
       total = parseInt(total);
       for (var i=0; i<total; i++)
         input.push(i);
       return input;
     };
   });

   app.filter('unsafe', ['$sce', function ($sce) {
       return function (val) {
           return $sce.trustAsHtml(val);
       };
   }]);

    app.filter('unsafe1', ['$sce', function ($sce) {
       return function (val) {
           var tmp = val.replace(/<img .*?>/g,""); 
           return $sce.trustAsHtml(tmp);
       };
   }]);

    

   app.controller('confirm', ['$scope', '$http', 'loaders','$state','$stateParams',function($scope, $http, loaders, $state, $stateParams){

      $scope.details = $stateParams.data;
      var host = "http://abacaticketing.com";

      if ($scope.details == null) {
         $state.go('home');
         return true;
      }

      var data = localStorage.getItem('booker');
      if (data) {
         data =  JSON.parse(data);
         data.birthday = new Date(data.birthday);
         data.passport_expiration = new Date(data.passport_expiration);
         $scope.details.booker = data;
      }
     
      if ( $scope.details.adult) {
       $scope.details.adult = parseInt($scope.details.adult);
      }

      if ($scope.details.child) {
        $scope.details.child  = parseInt($scope.details.child);
      }
     
      $scope.adult = {};
      $scope.adultFrm = [];
      $scope.child = {};
      $scope.childFrm = [];


      for (var i = 0; i < $scope.details.adult; i++) {
          $scope.adultFrm.push({
            firstname : "",
            lastname : "",
            birthday : "",
            gender : "",
            passport : "",
            passport_expiration : ""
          });
      }

      for (var i = 0; i < $scope.details.child; i++) {
          $scope.childFrm.push({
            firstname : "",
            lastname: "",
            birthday: "",
            gender: "",
            passport: "",
            passport_expiration : ""
          });
      }

      $scope.yearRange = function(startYear){
         var currentYear = new Date().getFullYear(), years = [];
            startYear = startYear || 1980;
            while ( startYear <= currentYear ) {
                    years.push(startYear++);
            } 
            years.reverse();
            return years;
      };

      $scope.cancel = function(){
         $state.go('home');
      }

      $scope.submit = function(){

 
          if (!($scope.details.booker)) {
               toastr.error('Please check your fields');
              return true;
          }

          $scope.details.passengers = {
            adult : $scope.adultFrm,
            child: $scope.childFrm
          }


          $scope.details.departure = new Date($scope.details.departure);

          if ($scope.details.return) {
            $scope.details.return = new Date($scope.details.return);
          }

          localStorage.setItem('booker', JSON.stringify($scope.details.booker));

          $http.post(host+'/booking', $scope.details).then(function(data){
            if (data.data.code == 200) {
              toastr.success(data.data.message);
              $state.go('home');
              return true;
            }
            toastr.error('Ooops something went wrong');
          });

      }

   }]);

   
   app.controller('abaca', ['$scope', '$http', 'loaders', '$state', function($scope, $http, loaders, $state){

      $scope.pagebanner = 1;
      $scope.page_promo = 1;
      
      $scope.checker = false;
      $scope.remaining = 0;

      $scope.flights = {};
      $scope.booking_flight = {};

      $scope.departure = null;

      var host = "http://abacaticketing.com";
   

      var fetchflights = function(type){
         loaders.fetchflights().then(function(data){
            if (type == "domestic") {
               $scope.flights = data.ph;
               return true;
            }
            $scope.flights= data.data;
         });
      }

      var fetchpromo = function(page){
         loaders.promo(page).then(function(data){
            $scope.checker = false;
            $scope.remaining = data.remaining;
            data.promodetails = $(data.promodetails)
            $scope.promo = data.data;

         });
      }
      $scope.promobook = function(id){

        loaders.viewpromo(id, $scope.page_promo).then(function(data){
            if (data.data.promotrip == "Round Trip") {
              data.data.promotrip = "roundtrip";
            }
            if (data.data.promotrip == "One way") {
              data.data.promotrip = 'oneway';
            }

            fetchflights(data.data.promo_t);

            $scope.booking_flight.trip = data.data.promotrip;
            $scope.booking_flight.to = data.data.promolocation;
            $scope.booking_flight.promodate_end = data.data.promodate_end;
            $scope.booking_flight.promo_id = data.data.id;
            $scope.booking_flight.promo_price = data.data.promoprice;
            $scope.booking_flight.type = data.data.promo_t;
            $scope.booking_flight.adult = data.data.adult.toString();
            $scope.booking_flight.child = data.data.child.toString();

        });


        $('html, body').animate({
            scrollTop: $("#searchTab").offset().top
        }, 800)

      }

      $scope.prev = function(page){
        if ($scope.checker) {
          return true;
        }
        $scope.checker = true;
        $scope.page_promo -=1;
        fetchpromo($scope.page_promo);
      }

      $scope.next = function(page){
         if ($scope.checker) {
            return true;
         }
        $scope.checker = true;
        $scope.page_promo +=1;
        fetchpromo($scope.page_promo);
      }

      $scope.clearbook = function(){
          location.reload();
      }

      $scope.booknow = function(){


         if ($scope.booking_flight.leaving || $scope.booking_flight.to) {

            $scope.booking_flight.departure = $('.departure_date').val();

            if ($scope.booking_flight.trip == "oneway") {
              if (!$scope.booking_flight.type || !$scope.booking_flight.leaving || !$scope.booking_flight.to || !$scope.booking_flight.departure || !$scope.booking_flight.adult) {
                toastr.error('Please check your fields')
                return true;
              }

              if ($scope.booking_flight.leaving == $scope.booking_flight.to) {
                toastr.error('Please check your destination');
                return true;
              }

              if ($scope.booking_flight.promo_id) {
                var date_end = $scope.booking_flight.promodate_end;
                var departure = new Date($scope.booking_flight.departure);
                departure = departure.getTime();

                // if (departure >= date_end) {
                //   toastr.error('Ooops Check your Promo Date');
                //   return true;
                // }
              }
            }

            if ($scope.booking_flight.trip == "roundtrip") {

              if ($scope.booking_flight.promo_id) {
                  console.log($scope.booking_flight);
                  var date_end = $scope.booking_flight.promodate_end;
                  var d_return = new Date($scope.booking_flight.return);
                  d_return = d_return.getTime();

                  // if (d_return > date_end) {
                  //   toastr.error('Ooops Check your Promo Date');
                  //   return true;
                  // }
              }

              if (!$scope.booking_flight.type || !$scope.booking_flight.leaving || !$scope.booking_flight.to || !$scope.booking_flight.departure || !$scope.booking_flight.adult) {
                toastr.error('Please check your fields')
                return true;
              }

              if ($scope.booking_flight.leaving == $scope.booking_flight.to) {
                toastr.error('Please check your destination');
                return true;
              }

            }

            if ($scope.booking_flight.trip == "multicity") {
              if (!$scope.booking_flight.type || !$scope.booking_flight.leaving  || !$scope.booking_flight.to  || !$scope.booking_flight.departure || !$scope.booking_flight.return || !$scope.booking_flight.adult || !$scope.booking_flight.child || !$scope.booking_flight.leaving2 || !$scope.booking_flight.to2) {
                toastr.error('Please check your fields')
                return true;
              }

              if ($scope.booking_flight.leaving == $scope.booking_flight.to) {
                toastr.error('Please check your destination');
                return true;
              }

              if ($scope.booking_flight.leaving2 == $scope.booking_flight.to2) {
                toastr.error('Please check your destination');
                return true;
              }

            }

            $scope.booking_flight.flight = true;
            $state.go('confirm-booking', {data: $scope.booking_flight});
         }

         if($scope.booking_hotel){

             $scope.booking_hotel.check_in = $('.check_in').val();

             if (!$scope.booking_hotel.go || !$scope.booking_hotel.check_in || !$scope.booking_hotel.check_out || !$scope.booking_hotel.adult || !$scope.booking_hotel.rooms || !$scope.booking_hotel.nights) {
                toastr.error('Please check your fields')
                return true;
             }

             $scope.booking_hotel.hotel = true;
             $state.go('confirm-booking', {data: $scope.booking_hotel});
         }

         if($scope.booking_holiday){

            if ($scope.booking_holiday.from == $scope.booking_holiday.go) {
                toastr.error('Please check your destination');
                return true;
            }

            $scope.booking_holiday.holiday = true;
            $state.go('confirm-booking', {data: $scope.booking_holiday});
         }

      }

      $scope.changeflights = function(){
         fetchflights($scope.booking_flight.type);
      }

      fetchflights();
      fetchpromo($scope.page_promo);
   }]);