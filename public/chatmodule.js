angular.module("simplechat",["ngSanitize"]);
//todo:画面を読み込んでから実行にできていない
//controllers
//chatCtrl:
function chatCtrl($scope,$http,$timeout){
  //最初のインターバルは1000秒。
  var checkinterval=1000;

  //init
  $scope.init=function(){
    //$scope.ap='http://chat.reponlabo.info/';
    $scope.ap='http://reponlabo.info/chat/';
    $scope.unreadlogsize=0;
    $scope.getmsgsize=20;
    $scope.msgcnt=0;
    //todo:「users」はおかしいので、logsかなにかに変える
    $scope.users=[];
    $scope.end='';
    $scope.trash=false;
    $scope.nextoffset=0;
  }

  //新規発言の読み込み
  function oncegetdata($scope,$http){
    $http.jsonp($scope.ap+'get?'+'callback=JSON_CALLBACK&'+'size='+$scope.getmsgsize+'&offset=0').success(function(data){
      for(var i in data){
        $scope.users.push(data[i]);
      }
    });
  }

  //メッセージ数の取得と発言の読み込み
  function gmt($scope,$http){
    //メッセージ数を取得
    $http.jsonp($scope.ap+'count?'+'callback=JSON_CALLBACK&').success(function(mescnt){
      //取得しているメッセージ数($scope.msgcnt)よりもサーバにあるメッセージが多いか、ログにメッセージが無いとき、サーバにメッセージを取得しに行く
      if(mescnt.cnt>$scope.msgcnt && $scope.users.length!=0){
        //$scope.unreadlogの取扱を変える。未読数だけ表示し、読み込む際には改めて差分をとる。
        //todo:すでに読み込んでいるログで、削除したものがあった場合の処理は、deleteCtrlに任せる
          $scope.unreadlogsize=mescnt.cnt-$scope.msgcnt;
      };
      //最初だけの読み込み
      if($scope.users.length==0){
        console.log("here is once");
        oncegetdata($scope,$http);
        //一回目の読み込み以降は、intervalを20000ミリ秒とする
        stopTimer();
        checkinterval=5000;
        startTimer(checkinterval);
        //リードポインタの更新（次に読み込むオフセット位置）
        $scope.nextoffset=$scope.nextoffset+$scope.getmsgsize;
        //読み込みログ数の更新
        $scope.msgcnt=mescnt.cnt;
      }
    });
  };

  //未読の読み込み
  //取得していないデータをサーバに取りに行く。
  $scope.showunread = function(){
    $http.jsonp($scope.ap+'count?'+'callback=JSON_CALLBACK&').success(function(mescnt){
      $http.jsonp($scope.ap+'get?'+'callback=JSON_CALLBACK&'+'size='+(mescnt.cnt-$scope.msgcnt)+'&offset=0').success(function(data){
        //取り込んだデータを逆順にする
        data.reverse();
        for(var i=0; i<data.length; i++){
          $scope.users.unshift(data[i])
        }
        //unreadlogのクリア
        $scope.unreadlogsize=0;
        //読み込みログ数の更新
        $scope.msgcnt=mescnt.cnt;
      });
    });
  }

  //新しいメッセージの自動取得のためのタイマー作成
  var timer;

  function startTimer(checkinterval){
    timer = setInterval(gmt,checkinterval,$scope,$http);
  }
  startTimer(checkinterval);

  //timerのストップ
  function stopTimer(){
    clearInterval(timer);
  };
  $scope.stoptimer = function(){
    stopTimer();
  }

  //post
  $scope.postComment = function(){
  //postする
    $http.jsonp($scope.ap+'post?'+'callback=JSON_CALLBACK&'+'member='+$scope.name+'&'+'data='+$scope.comment).success(function(data){
    //コメント欄クリア
      $scope.comment="";
      //発言数の取得＆新規発言の取得と反映
      $http.jsonp($scope.ap+'count?'+'callback=JSON_CALLBACK&').success(function(mescnt){
        //0番目（先頭）から、サーバにあるメッセージ数(mescnt.cnt)-取得しているメッセージ数($scope.msgcnt)を取得
        $http.jsonp($scope.ap+'get?'+'callback=JSON_CALLBACK&'+'size='+(mescnt.cnt-$scope.msgcnt)+'&offset=0').success(function(data){
          data.reverse();
          for(var i=0; i<data.length; i++){
            $scope.users.unshift(data[i])
          }
          //unreadlogのクリア
          $scope.unreadlogsize=0;
        });
        //読み込みログ数の更新
        $scope.msgcnt=mescnt.cnt;
      });
    });
  };

  //readmore
  $scope.readmore = function(){
    gmt($scope,$http);
    if($scope.msgcnt>$scope.users.length || $scope.users.length==0){
      var getsize=$scope.getmsgsize;
      if(($scope.msgcnt-$scope.users.length)<$scope.getmsgsize){
        getsize=$scope.msgcnt-$scope.users.length;
      };
      if($scope.users.length==0){getsize=$scope.getmsgsize;};
      $http.jsonp($scope.ap+'get?'+'callback=JSON_CALLBACK&'+'size='+$scope.getmsgsize+'&offset='+$scope.nextoffset).success(
        function(data) {
          //data.reverse();
          for(var i=0; i<data.length; i++){
            $scope.users.push(data[i])
          }
        //リードポインタの更新
        $scope.nextoffset=$scope.nextoffset+$scope.getmsgsize;
        console.log($scope.nextoffset);
        }
      );
    } else {
      $scope.end="これ以上はありません";
    } ;
  };
};
//update & delete
function updelPost($scope,$http){
  //削除
  $scope.adddelflag = function(){
    $http.jsonp($scope.ap+'delete?'+'callback=JSON_CALLBACK&'+'delid='+$scope.user.id+'&'+'roomid=1').success(
      function(data){
        //$scope.logから該当するidを削除します
        for(var i=0; i< $scope.users.length; i++){
          if($scope.users[i].id==data.delid){
            //削除
            $scope.users.splice(i,1);
          }
        }
      }
    )
  }
}