Sequel.migration do
  change do
    create_table(:chatdata) do
      primary_key :id
      Integer     :roomid
      String      :member
      String      :data, :text=>true
      String      :create_at
      String      :change_at
      TrueClass   :deleted, :default=>false
      String      :otherdataid, :text=>true
      index       [:roomid, :member, :data, :deleted]
    end
  end
end