require 'bundler'
Bundler.require

require 'sinatra/base'
require 'haml'

class Testroku < Sinatra::Base
  get '/' do
    haml :index
  end
end

