(function() {
  var APPID, CLIENTID, initializeModel, loadModel, openCallback, pos2str, synchronize, _client, _editor, _markdown;


	APPID = window.APPID = "459724105666";
  CLIENTID = '459724105666-lddqnj7mqpqc37spubjnocbcfa6eq69v.apps.googleusercontent.com';
  var url = window.location.pathname;
  var filename = url.substring(url.lastIndexOf('/')+1);
  var codeMode = filename.split(".")[0];

  var fn = "";
  switch(codeMode) {
      case "environment":
        fn = "environment.json";
        break;
      case "program":
        fn = "program.js";
        break;
      case "tests":
        fn = "tests.js"
        break;
  }

  _client = null;
  _editor = null;
  var programMarkup = "function(robot){};";

  $(function() {

    _editor = CodeMirror(document.getElementById("editor"), {

      matchBrackets: true,
      continueComments: "Enter",
      mode:  (codeMode === "environment" ? "application/json" : "javascript"),
      gutters: ["CodeMirror-lint-markers"],
      lint: true,
      theme: "monokai",
      lineNumbers: true,
      lineWrapping: true,
      readOnly: true,
      keyMap: "sublime",
      autoCloseBrackets: true, 
      showCursorWhenSelecting: true,
    });
    window.editor = _editor;
    _editor.setValue("");
    _editor.setSize("100%", "100%");
    _client = window._client = new rtclient.RealtimeLoader({
      appId: APPID,
      clientId: CLIENTID,
      authButtonElementId: 'btn-auth',
      autoCreate: false,
      defaultTitle: fn,
      initializeModel: initializeModel,
      onFileLoaded: loadModel
    });
    /*$('#btn-create').click(function() {
      if ($('#btn-create').hasClass('disabled')) {
        return;
      }
      $('#btn-create').addClass('disabled');
      $('#btn-open').addClass('disabled');
      $('#btn-share').addClass('disabled');
      return _client.createNewFileAndRedirect();
    });*/
    $('#btn-open').click(function() {
    });
    /*$('#btn-share').click(function() {
      if ($('#btn-share').hasClass('disabled')) {
        return;
      }
      return alert("Share doesn't work without HTTPS, just used drive.google.com to change share settings!");
    });*/
    $('#btn-auth').removeClass('disabled').show();
    return _client.start(function() {
      $('#btn-auth').addClass('disabled').hide();
      $('#btn-create').removeClass('disabled');
      return $('#btn-open').removeClass('disabled');
    });
  });

  openCallback = window.openCallback = function(data) {
    var fileId;
    if (data.action === google.picker.Action.PICKED) {
      fileId = data.docs[0].id;
      return rtclient.redirectTo(fileId, _client.authorizer.userId);
    }
  };

  initializeModel = function(model) {
    var markdown = "";
    switch(codeMode) {
        case "environment":
          markdown = window.getEnvironmentMetaSourceCode( window.getEnvironmentMeta()) ;
          break;
        case "program":
          markdown = window.opener.robot.program.rawCode() ;
          break;
        case "tests":
          markdown = window.opener.tests.program.rawCode() ;
          break;
    }

    markdown = model.createString(markdown);
    model.getRoot().set('markdown', markdown);


    switch(codeMode) {
        case "environment":
          window.refreshWallMetaSourceCode();
          break;
        case "program":
          window.refreshrobotSourceCode();
          break;
        case "tests":
          window.refreshTestSourceCode();
          break;
    }
    
    return 
  };

  _markdown = null;

  loadModel = function(doc) {
    gapi.client.load('drive', 'v2', function() {
      var request;
      request = gapi.client.drive.files.get({
        fileId: rtclient.params['fileId']
      });
 
      $(window.txtDocName.domElement).find("input:first").attr('disabled', '');
      return request.execute(function(resp) {
 
        window.config.docName = resp.title;
        $(window.txtDocName.domElement).find("input:first").removeAttr('disabled');
        return;
      });
    });
    
    _markdown = doc.getModel().getRoot().get('markdown');
    _editor.setOption('readOnly', false);
    var txt = (_markdown.getText());
    _editor.setValue(txt);

    try {
      if (codeMode === "environment"){
        var newMeta = JSON.parse(_markdown.getText());
        window.robotConfig.position.x = newMeta.robot.position.x;
        window.robotConfig.position.z = newMeta.robot.position.z;
        window.homeBoxConfig.x = newMeta.homeBox.position.x;
        window.homeBoxConfig.z = newMeta.homeBox.position.z;
        window.opener.engine.loadEnvironment(newMeta);
      } else {
        //assign programm to robot
        
      }
    } catch (e) {
    } finally {
    }
    return synchronize(_editor, _markdown);

  };

  pos2str = function(_arg) {
    var ch, line;
    line = _arg.line, ch = _arg.ch;
    return line + ":" + ch;
  };

  synchronize = function(editor, markdown) {
    var ignore_change;
    ignore_change = false;
    editor.on('beforeChange', function(editor, changeObj) {
      var from, text, to;
      if (ignore_change) {
        return;
      }
      from = editor.indexFromPos(changeObj.from);
      to = editor.indexFromPos(changeObj.to);
      text = changeObj.text.join('\n');
      if (to - from > 0) {
        console.log("markdown.removeRange(" + from + ", " + to + ")");
        markdown.removeRange(from, to);
      }
      if (text.length > 0) {
        try {
          //var newMeta = JSON.parse(_editor.getValue());
          //window.opener.engine.loadEnvironment(newMeta);
        } catch (e) {
        } finally {
        }
        console.log("markdown.insertString(" + from + ", '" + text + "')");
        return markdown.insertString(from, text);

      }
    });
    markdown.addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, function(e) {
      var from;
      if (e.isLocal) {
        return;
      }
      from = editor.posFromIndex(e.index);
      ignore_change = true;
      console.log("editor.replaceRange('" + e.text + "', " + (pos2str(from)) + ", " + (pos2str(from)) + ")");
      editor.replaceRange(e.text, from, from);
      return ignore_change = false;
    });
    return markdown.addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, function(e) {
      var from, to;
      if (e.isLocal) {
        return;
      }
      from = editor.posFromIndex(e.index);
      to = editor.posFromIndex(e.index + e.text.length);
      ignore_change = true;
      console.log("editor.replaceRange('', " + (pos2str(from)) + ", " + (pos2str(to)) + ")");
      editor.replaceRange("", from, to);
      return ignore_change = false;
    });
  };

 
  window.opener.engine.done();

}).call(this);