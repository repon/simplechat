function Ctrl($scope,$http){
  $scope.init=function(){
    //$scope.ap="http://chat.reponlabo.info/";
    $scope.ap="http://reponlabo.info/chat/";
    $scope.callback="callback=JSON_CALLBACK"
    $scope.logs=[];
    $scope.keys=[];
    $scope.members=[];
    $scope.memberquery="";
    $scope.dataquery="";
    $scope.orderProp="";
  }

  $scope.getdata=function(){
    $http.jsonp($scope.ap+"count?"+$scope.callback).success(function(msgcnt){
      $http.jsonp($scope.ap+"get?"+$scope.callback+"&size="+msgcnt.cnt+"&offset=0").success(function(data){
        $scope.logs=data;
        for(var i in data[0]){
          $scope.keys.push(i);
        }
      });
    });
  }

}