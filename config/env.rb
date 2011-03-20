set :haml, { :format => :html5 }


# require 'dm-core'
# require 'dm-sqlite-adapter'
# 
# DataMapper.setup :default, "sqlite://#{APP_PATH}/db/app.sqlite"
# 
# 
# Dir.glob("#{APP_PATH}/models/*").each do |model|
#   require model
# end

require 'voidtools'
include Voidtools::Sinatra::ViewHelpers


class NilClass
  def blank?
    nil?
  end
end

class String
  def blank?
    nil? || self == ''
  end
end


require "#{APP_PATH}/models/jquery_file_tree"