app.factory('loaders', ['$http', function($http){

      var data = {};
      var host = "http://abacaticketing.com"

      data.fetchflights  = function(){
         return $http.get(host+'/get/flights').then(function(data){
            return data.data;
         });
      }

      data.fetchbanner = function(page){
         return $http.get(host+'/action?method=fetchbanner&type=banner&page='+page).then(function(data){
            return data.data;
         });
      }

      data.fetchnews = function(page){
         return $http.get(host+'/action?method=fetchnews&page='+page).then(function(data){
            return data.data;
         });
      }

      data.fetchgallery = function(page){
         return $http.get(host+'/action?method=fetchgallery&page='+page).then(function(data){
            return data.data;
         });
      }

      data.promo = function(page){
          return $http.get(host+'/action?method=fetchpromo&page='+page).then(function(data){
            return data.data;
         });
      }

      data.about = function(){
         return $http.get(host+'/action?method=fetchabout').then(function(data){
            return data.data;
         });
      }

      data.fetchsinglenews = function(id){
         return $http.get(host+'/action?method=readnews&id='+id).then(function(data){
            return data.data;
         });
      }

      data.viewpromo = function(id, page){
         return $http.get(host+'/action?method=viewpromo&id='+id).then(function(data){
            return data.data;
         });
      }

      return data;

}]);