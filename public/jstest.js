function Ctrl($scope,$http){
  $scope.init=function(){
    //$scope.ap="http://chat.reponlabo.info/";
    $scope.ap="http://reponlabo.info/chat/";
    $scope.callback="callback=JSON_CALLBACK"
    $scope.count="";
  }

  $scope.getdata=function(){
    $http.jsonp($scope.ap+"test?"+$scope.callback).success(function(msgcnt){
      $scope.count=msgcnt.cnt;
    });
  }

}