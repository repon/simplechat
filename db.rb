Sequel.migration do
  change do
    create_table(:chatdata, :ignore_index_errors=>true) do
      primary_key :id
      Integer :roomid
      String :member, :size=>255
      String :data, :text=>true
      String :creat_at, :size=>255
      String :change_at, :size=>255
      TrueClass :deleted, :default=>false
      String :otherdataid, :text=>true
      
      index [:roomid, :member, :data, :deleted]
    end
    
    create_table(:schema_info) do
      Integer :version, :default=>0, :null=>false
    end
  end
end
