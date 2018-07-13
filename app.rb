#! /usr/local/bin/ruby
# coding:utf-8
# チャットAPI
  require 'bundler'
  require 'sinatra'
  require 'sinatra/json'
  require 'sinatra/jsonp'
  require 'sqlite3'
  require 'sequel'
  require 'json'
  require 'sass'
  require 'haml'
  require 'sinatra/reloader' if development?
  require 'sinatra/cross_origin'

configure do
  enable :cross_origin
end

before do
  @title="チャットAPI"
  @db=Sequel.sqlite('main.db')
  @chatdata=@db[:chatdata]
  @roomid=1#最初に割り当てる。
end

helpers do

end
=begin
get '/count' do
  cnt=open(@countertxtfile).read.strip.to_i
  counter={:cnt=>cnt}
  jsonp counter, "#{params[:callback]}"
  #json params
end
=end

get '/' do

end

get '/count' do
  @roomid=params[:roomid] if (params[:roomid] && params[:roomid]=~/[0-9]*[1-9]+/)
  @dat={cnt:@chatdata.where(:roomid=>@roomid).count,trash:@chatdata.where(:roomid=>@roomid,:deleted=>true).map(:id).sort}
  # @dat={:cnt=>@chatdata.where(:roomid=>@roomid).count}
  jsonp @dat, "#{params[:callback]}"
end

get '/count.jsonp' do
  call env.merge('PATH_INFO' => '/count')
end

get '/get' do
  @roomid=params[:roomid] if (params[:roomid] && params[:roomid]=~/[0-9]*[1-9]+/)
  size=(params[:size] && params[:size]=~/[0-9]+/) ? params[:size].to_i : 5
  offset=(params[:offset] && params[:offset]=~/[0-9]+/) ? params[:offset].to_i : 0
  #offsetからsizeずつ返す
  @dat=[]
  @chatdata.where(:roomid=>@roomid).exclude(:deleted=>true).reverse(:id).limit(size,offset).all.each do |row|
    x={}
    row.each do |k,v|
      if k==:create_at
        x[k]=Time.at(v.to_i).strftime("%m/%d %H:%M:%S")
      else
        x[k]=v
      end
    end
    @dat<<x
  end
  jsonp @dat, "#{params[:callback]}"
end

get '/getcomment.jsonp' do
  call env.merge('PATH_INFO' => '/get')
end

get '/post' do
  #発言のインサート
  #counterの変更
  @changecounter=true

  id=0
  @dat=[]
  if params[:member] && params[:data]
    id=@chatdata.insert(
      :roomid   =>   @roomid,
      :member   =>   params[:member],
      :data     =>   params[:data],
      :create_at =>   Time.now.to_i
      )
  end
  @dat={}
  @chatdata.where(:id=>id).first.each do |k,v|
    if k==:create_at
      @dat[k]=Time.at(v.to_i).strftime("%Y-%m-%d %H:%M:%S")
    else
      @dat[k]=v
    end
  end
  jsonp @dat, "#{params[:callback]}"
end

get '/update' do
  #counterの変更
  @changecounter=true

  @dat={}
  res=""
  @dat={:editid=>params[:delid],:data=>params[:data]}
  jsonp @dat, "#{params[:callback]}"
end

get '/delete' do
  #counterの変更
  @changecounter=true

  @dat={}
  res=""
  if params[:delid] && params[:roomid]
    if !@chatdata.where(:id=>params[:delid],:roomid=>params[:roomid]).empty?
      @chatdata.where(:id=>params[:delid],:roomid=>params[:roomid]).update(:deleted=>true)
    end
  end
  @dat={:delid=>params[:delid]}
  jsonp @dat, "#{params[:callback]}"
end


post '/newcomment' do
  #発言のインサート
  # #counterの変更
  # @changecounter=true
  @roomid=params[:roomid] if (params[:roomid] && params[:roomid]=~/[0-9]*[1-9]+/)
  id=0
  @dat=[]
  if params[:member] && params[:data]
    id=@chatdata.insert(
      :roomid   =>   @roomid,
      :member   =>   params[:member],
      :data     =>   params[:data],
      :create_at =>   Time.now.to_i
      )
  end
  # @dat={}
  # @chatdata.where(:id=>id).first.each do |k,v|
  #   if k==:create_at
  #     @dat[k]=Time.at(v.to_i).strftime("%Y-%m-%d %H:%M:%S")
  #   else
  #     @dat[k]=v
  #   end
  # end
  # jsonp @dat, "#{params[:callback]}"
end

post '/editcomment' do
  # 発言の編集。現時点ではまだ出来ていない。多分実装は簡単。ただ、やるならこれ、useridなりsessionなりで判断しないといかん。いいのか。
  @roomid=params[:roomid] if (params[:roomid] && params[:roomid]=~/[0-9]*[1-9]+/)
  # #counterの変更
  # @changecounter=true
  #
  # @dat={}
  # res=""
  # @dat={:editid=>params[:delid],:data=>params[:data]}
  # jsonp @dat, "#{params[:callback]}"
end

post '/deletecomment' do
  @roomid=params[:roomid] if (params[:roomid] && params[:roomid]=~/[0-9]*[1-9]+/)
  # #counterの変更
  # @changecounter=true

  res=""
  if params[:delid] && params[:roomid]
    if !@chatdata.where(:id=>params[:delid],:roomid=>params[:roomid]).empty?
      @chatdata.where(:id=>params[:delid],:roomid=>params[:roomid]).update(:deleted=>true)
    end
  end
end

post '/test' do
  puts params
end

=begin
after do
  if @changecounter
    cnt=open(@countertxtfile).read
    if cnt=~/^[0-9]+$/ && cnt!="" && cnt!=nil
      oldcount = cnt.to_i
      currentcount=@chatdata.where(:roomid=>@roomid).count
      if oldcount!=currentcount
        f=open(@countertxtfile,"w")
        f.puts currentcount
        f.close
      end
    end
  end
end
=end
