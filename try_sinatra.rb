require 'haml'
require 'sass'
require 'sinatra'
require 'json'
enable :sessions

path = File.expand_path "../", __FILE__
APP_PATH = path

class UnsaneStringError < Exception
  def message
    "The string '#{self}' you are using is not sane, sorry, only sane strings allowed"
  end
end

class String
  def sanitize!
    raise UnsaneStringError unless self =~ /\w+/
  end
end


class TrySinatra < Sinatra::Base
  require "#{APP_PATH}/config/env"
  
  set :haml, { :format => :html5 }
  require 'rack-flash'
  enable :sessions
  use Rack::Flash
  require 'sinatra/content_for'
  helpers Sinatra::ContentFor
  set :method_override, true

  def not_found(object=nil)
    halt 404, "404 - Page Not Found"
  end

  get "/" do
    @contents = File.read "#{APP_PATH}/public/hello.rb"
    haml :index
  end

  PROJECTS_SRC = "#{APP_PATH}/public/projects_src"
  
  post "/projects/*/files/save" do |project|
    # FIXME: sanitize parameters
    path = params[:path]
    contents = params[:contents]
    name = params[:name]    
    error = nil
    begin
      File.open("#{PROJECTS_SRC}/#{project}/#{path}", "w"){ |f| f.write contents }
    rescue Exception => e
      error = e
    end
    
    response = if error.nil?
      # { file:  }
      { message: "Saved.", file: { name: name, path: path } }
    else
      { error: "Cannot read from file. #{error.message}" } # TODO: report right exception
    end
    response.to_json
  end
  
  # file read
  
  get "/projects/*/files/*" do |project, file|
    # FIXME: check that project is /w+ or similar
    content_type :json
    contents = File.read "#{PROJECTS_SRC}/#{project}/#{file}"
    { project: { name: project }, file: { contents: contents, path: file, name: File.basename(file) } }.to_json
  end

  get '/projects/*/log' do
    logs = `cd #{APP_PATH}/public/projects_src/testroku; heroku logs`
    logs.split("\n").join("<br>")
  end

  # git/heroku
  ##################################
  # TODO: implement this workflow
  #
  # login
  # add key ( heroku keys:add )
  # project = "testroku2"
  # "mkdir -p #{project}"
  # "heroku create #{project}"
  # 
  # create basic files (Gemfile, config.ru, #{project}.rb)
  
  # ...  
  
  # destroy
  # heroku destroy --app testroku2 --confirm testroku2
  
  post "/projects/*/pull" do |project|
    project.sanitize!
    error = nil  
    
    # begin      
      result = `cd #{PROJECTS_SRC}/#{project} && git pull heroku master`
      puts "push: #{result}"
    # rescue Exception => e
    #   error = e
    # end
    
    response = if error.nil?
      { message: "Git pull successful." }
    else
      { error: "Cannot pull from git. #{error.message}" } # TODO: report right exception
    end
    response.to_json  
  end
  
  post "/projects/*/push" do |project|
    project.sanitize!
    error = nil
    
    # begin      
      result = `cd #{PROJECTS_SRC}/#{project} && git add * && git commit -m "pushing from TrySinatra" && git push heroku master`
      puts "push: #{result}"
    # rescue Exception => e
    #   error = e
    # end
    
    response = if error.nil?
      # { file:  }
      { message: "Deploy successful." }
    else
      { error: "Cannot push on heroku. #{error.message}" } # TODO: report right exception
    end
    response.to_json
  end
  
  # file list 
  
  post "/projects/*" do |project|
    @dir = params[:dir]
    @dirs, @files = JqueryFileTree.new("#{PROJECTS_SRC}/#{@dir}").get_content
    haml :filetree, layout: false
  end

  get '/css/main.css' do
    sass :main
  end
  
end