var ap="http://reponlabo.info/chat";

var vm = new Vue({
  el:"#app",
  data:{
    roomid:1,
    count:{},
    cntreal:0,
    precount:{cnt:0,trash:[]},
    comments:[],
    flags:{
      first:false,
      post:false,
      trash:false,
    },
    unreadlogsize:0,
    getmsgsize:20,
    getmsgoffset:0,
    end:"", //"これ以上はありません";
    checkinterval:5000,
    // post:false,
    org:{}
  },
  ready:function(){
    // 初回読み込み
    this.flags.first=true;
    this.getCount();
    this.getComments();
    console.log(this.unreadlogsize);
    // 以後、等間隔で読み込み
    // checkInterval();
  },
  methods:{
    getCount:function(){
      // サーバにcommentとtrashの数を取りに行く
      var that=this;
      $.ajax({
        url:ap+"/count.jsonp",
        dataType:"jsonp",
        data:{
          roomid:this.roomid
        }
      }).done(function(e){
        console.log(e);
        // 初回処理
        if(that.flags.first===true){
          console.log("初回処理");
          that.count=e;
          that.cntreal=e.cnt;
          // that.precount=e;
          that.flags.first=false;
        }else{
        // 2回目以降
          console.log("2回目以降 count",that.count.cnt,"e",e);
          // 削除処理
          if(that.count.trash.length!==e.trash.length){
            console.log("削除処理");
            // commentsに該当のidがあれば削除する。
            for(var i=0;i<that.comments.length;i++){
              for(var j=0;j<e.trash.length;j++){
                if(that.comments[i].id===e.trash[j]){
                  console.log("id",that.comments[i].id,"を削除");
                  that.comments.splice(i,1);
                }
              }
            }
          }
          // 未読処理
          if(that.count.cnt!==e.cnt){
            console.log("未読処理 書き込み？",that.flags.post);
            if(!that.flags.post){
              // 定期読み込み
              console.log("定期読み込み。「未読」表示を行う。未読数",e.cnt-that.count.cnt,"e.cnt",e.cnt,"count.cng",that.count.cnt);
              that.unreadlogsize=e.cnt-that.count.cnt;
            } else {
              // 書き込み
              console.log("書き込み。すぐに読み込む。 未読数",e.cnt-that.count.cnt);
              that.unreadlogsize=e.cnt-that.count.cnt;
              that.showunread();that.flags.post=false;
            }
          }
          // 最終処理
          // 更新はtrashだけで良い。
          // showunread処理を終えた時に、e.cnt=that.count.cntとなる
          // が、e.cntの保持の必要があるので、that.cntrealに保持する。
          that.cntreal=e.cnt;
          that.count.trash=e.trash;
          console.log("最終処理 count",that.count,"e",e);
        }
      });
    },
    getComments:function(){
      var that = this;
      $.ajax({
        url:ap+"/getcomment.jsonp",
        dataType:"jsonp",
        data:{
          roomid:this.roomid,
          size:this.getmsgsize,
          offset:this.getmsgoffset
        }
      }).done(function(e){
        console.log(e);
        if(that.comments.length===0){
          // 初回読み込み
          console.log("初回comment読み込み");
          that.comments=e;
        } else {
          // 2回目以降
          console.log("comments2回目以降。 unreadlogsize",that.unreadlogsize,"post",that.flags.post);
          if(that.unreadlogsize>0){
            // 「未読読み込み」の場合
            console.log("未読読み込み",e);
            // for(var i=0;i<e.length;i++){
            for(var i=e.length-1;0<=i;i--){
              // 逆順に呼び出して、頭にくっつけていく。
              console.log("commentsに挿入",e[i]);
              that.comments.unshift(e[i]);
            }
            that.getmsgsize=that.org.getmsgsize;
            that.getmsgoffset=that.org.getmsgoffset;
            that.unreadlogsize=0;
            // 未読数を解消したので、count.cntをサーバと一致させる（リードポインタを合わせる
            that.count.cnt=that.cntreal;
            console.log("書き込み終了。getmsgsize",that.getmsgsize,"getmsgoffset",that.getmsgoffset);
          } else {
            // 追加読み込み（もっと読む）ボタンを押したとき
            console.log("追加読み込み");
            for(var j=0;j<e.length;j++){
              that.comments.push(e[j]);
            }
          }
        }
      });
    },
    readmore:function(){
      // 「もっと読む」。未読は置いておくほうがわかりやすい。
      // 削除idの対応はいらない（count読み込みの際にやる）
      var that = this;
      console.log("this.unreadlogsize",that.unreadlogsize);
      this.getmsgoffset=this.comments.length+this.unreadlogsize;
      console.log("unreadlogsize is ",that.unreadlogsize);
      console.log("offset is ",this.getmsgoffset);
      this.getComments();
    },
    showunread:function(){
      // 未読の読み込み
      var that = this;
      if(that.unreadlogsize>0){
        console.log("未読読み込み");
        that.org.getmsgsize=that.getmsgsize;
        that.org.getmsgoffset=that.getmsgoffset;
        that.getmsgsize=that.unreadlogsize;
        that.getmsgoffset=0;
        console.log("getmsgsize",that.getmsgsize,"getmsgoffset",that.getmsgoffset,"unreadlogsize",that.unreadlogsize);
        that.getComments();
      }
    },
    sendComment:function(e){
      // 書き込み
      console.log(e.name,e.comment);
      var that = this;
      $.ajax({
        url:ap+"/newcomment",
        type:"POST",
        data:{
          roomid:that.roomid,
          member:e.name,
          data:e.comment
        }
      }).always(function(){
        // 成否にかかわらず書き込みを読み込む
        that.flags.post=true;
        console.log("書き込み終了。");
        that.getCount();
        // textareaをクリア
        that.comment="";
      });
    },
    adddelflag:function(e){
      console.log("削除フラグを付けます。",e.id);
      var that = this;
      $.ajax({
        url:ap+"/deletecomment",
        type:"POST",
        data:{
          roomid:that.roomid,
          delid:e.id
        }
      }).always(function(){
        that.getCount();
      });
    }
  }
});

// Vue.filter('setCount',function(value,key){
//   // filterByなどでフィルタリングされた数を返す
//   // valueがfilterByでフィルタされた配列、keyはsetCountの引数として与えられる数。
//   this[key]=value.length;//keyに配列の個数を与える
//   return value;//配列そのものを返す（なので、この後に続けることも出来る。重要）
// });

Vue.filter('to_url',function(value){
  var reg=/(https?:\/\/[a-zA-Z0-9\-_\.:@!~*'\(¥);/?&=\+$,%#]+)/gi;
  value=value.replace(reg,function($1){
    // console.log("function",$1);
    return " <a href='"+$1+"' target='_blank'>"+$1.substr(0,20)+"...</a> ";
    // return "<blockquote><p><a href='$1' target='_blank'>$1</a></p></blockquote>";
  });
  return value;
});

setInterval(function(){
  console.log(vm.checkinterval,"m秒ごとに呼び出し");
  vm.getCount();
},vm.checkinterval);
