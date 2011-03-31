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
    window.open("http://"+project+".heroku.com")
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
})