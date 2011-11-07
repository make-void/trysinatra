$(function(){
  // fixtures
  var project = "testroku"
  
  // init
  $("#project").attr("data-name", project) // hmmm.. not very classy
  
  // ace editor
  
  var editor = ""
  if ($.browser.ipad || document.URL.match(/\?ipad/) )
    window.onload = summon_editor_ipad
  else
    window.onload = summon_editor

  function summon_editor_ipad() {
    file = $("pre#editor").text()
    $("pre#editor").html("<textarea id='ed_content'>"+file+"</textarea>")
  }

  function summon_editor() {
    editor = ace.edit("editor")
    editor.setTheme("ace/theme/twilight")

    //var JavaScriptMode = require("ace/mode/coffee").Mode
    var RubyMode = require("ace/mode/ruby").Mode
    
    var currentMode = new RubyMode()
    
    editor.getSession().setMode(currentMode)
  }
  
  // nav
  
  $('#filelist_btn').click(function() {
    $("body").toggleClass("drawerOpen")
    editor.setTheme("ace/theme/twilight")
  })
  
  function update_status(status) {
    $("#status").html("<p>"+status+"</p>"+$("#status").html())
  }
  
  function save_file(name, path, contents) {
    $.post("/projects/"+project+"/files/save", { "name": name, "path": path, "contents": contents },
      function(data){
        var status = ""
        if (data.message)
          status = data.message
        else
          status = "Got an error: "+data.error
          
        update_status(status)
     }, "json")
  }
  
  // FIXME: refactor these two
  
  function git_pull() {
    $.post("/projects/"+project+"/pull", {}, function(data) {
      var status = ""
      if (data.message)
        status = data.message
      else
        status = "Got an error: "+data.error
        
      update_status(status)
    }, "json")
  }
  
  function push_to_heroku() {
    $.post("/projects/"+project+"/push", {}, function(data) {
      var status = ""
      if (data.message)
        status = data.message
      else
        status = "Got an error: "+data.error
        
      update_status(status)
    }, "json")
  }
  
  $('#log_btn').click(function(){
    project = $("#project").attr("data-name")
    document.location = "/projects/"+project+"/log"
  })
  
  
  $('#pull_btn').click(function(){
    update_status("pulling from git...")

     git_pull()
  })
  
  $('#push_btn').click(function() {
    update_status("pushing to heroku...")
    
    push_to_heroku()
  })
  $('#save_btn').click(function() {
    update_status("saving file...")
    project = $("#project").attr("data-name")
    name = $("#file").attr("data-name")
    path = $("#file").attr("data-path")
    contents = editor.session.toString()
    
    save_file(name, path, contents)
  })
  
  
  $('#preview_btn').click(function() {
    project = $("#project").attr("data-name")
    document.location = "http://"+project+".heroku.com"
  });
  
  // jQuery filetree
  
  
  $('#filetree').fileTree(
    { root: project, script: '/projects/'+project+"/" }, 
    function(file) {
      file = file.replace(project+"/", "")
    
      var file_contents = ""
    
      $.getJSON("/projects/testroku/files/"+file, function(data){
        file_contents = data.file.contents
        $("pre#editor").html(file_contents)
        $("#file").attr("data-contents", file_contents)
        $("#project").attr("data-name", data.project.name)
        $("#file").attr("data-name", data.file.name)
        $("#file").attr("data-path", data.file.path)
  
        summon_editor()
      })
    }
  )
  
  function detect_path(self){
    return $(self).find("a").attr("rel")
  }
  
  $("body").live('click', function(){
    $("#filelist #pane").fadeOut('fast')
  })
  
  // right click (new file / new folder / delete file)
  $('#filetree li').live("mousedown", function(event) {
    
    if ($(this).hasClass("directory"))
      $("#filelist .delete").html("Delete directory")
    else
      $("#filelist .delete").html("Delete file")
      
    if (event.which == 3) { // right click
      path = detect_path(this)
      // console.log(path)
      $("#selection").attr("data-path", path)
      $("#filelist #pane").fadeIn("fast")
      $("#filelist #pane").css("left", event.pageX-20)
      $("#filelist #pane").css("top", event.pageY-70)
    } else {      
      $("#filelist #pane").fadeOut('fast')
    }
    
    event.stopPropagation()
    event.preventDefault()
    return false
  })
  
  // suppress event in webkit
  $('#filetree li').live("contextmenu", function(event){    
    event.stopPropagation()
    event.preventDefault()
    return false
  })
  
  function get_path() {
    path = ""
    splits = $("#selection").attr("data-path").split(/\//)
    for (var i=0; i+1 < splits.length; i++) {
      if (path != "")
        path += "/" 
      path += splits[i]
    }
  }
  
  $('#filelist .new_file').live("click", function(event){
    path = get_path()
    console.log("creating new file in: "+path)
  })  
    
  $('#filelist .new_folder').live("click", function(event){
    path = get_path()
    console.log("creating new folder in: "+path)
  })
  
  $('#filelist .delete').live("click", function(event){
    path = $("#selection").attr("data-path")
    console.log("deleting: "+path)
  })
//  document.oncontextmenu = function(event){
//    console.log(event)
//  }
  
})