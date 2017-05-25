  var audio_context;
  var recorder;

  function __log(e, data) {
    log.innerHTML += "\n" + e + " " + (data || '');
  }



  function startUserMedia(stream) {
    var input = audio_context.createMediaStreamSource(stream);
    __log('Media stream created.' );
  __log("input sample rate " +input.context.sampleRate);

    // Feedback!
    //input.connect(audio_context.destination);
    __log('Input connected to audio context destination.');

    recorder = new Recorder(input, {
                  numChannels: 1,
                  callback:function(wavBlob){}
                  // onMp3Blob:onMp3Blob,
                  // onMp3Url:onMp3Url
                });
    __log('Recorder initialised.');
    window.onRecorderReady && window.onRecorderReady();
  }

  function startRecording(button) {
    // recorder.connect();
    recorder && recorder.record();
    button.disabled = true;
    button.nextElementSibling.disabled = false;
    __log('Recording...');
  }

  function stopRecording(button) {
    recorder && recorder.stop();
    // recorder.disconnect();
    button.disabled = true;
    button.previousElementSibling.disabled = false;
    __log('Stopped recording.');

    // create WAV download link using audio data blob
    // createDownloadLink();//收集缓冲区数据->wav->mp3。
    // recorder.clear();//清除缓冲区数据
  }

  function createDownloadLink() {
    recorder && recorder.exportWAV(function(blob) {
      /*var url = URL.createObjectURL(blob);
      var li = document.createElement('li');
      var au = document.createElement('audio');
      var hf = document.createElement('a');

      au.controls = true;
      au.src = url;
      hf.href = url;
      hf.download = new Date().toISOString() + '.wav';
      hf.innerHTML = hf.download;
      li.appendChild(au);
      li.appendChild(hf);
      recordingslist.appendChild(li);*/
    });
  }

  function init() {
    try {
      // webkit shim
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      navigator.getUserMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);
      window.URL = window.URL || window.webkitURL;

      audio_context = new AudioContext;
      __log('Audio context set up.');
      __log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
    } catch (e) {
      alert('No web audio support in this browser!');
    }

    navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
      __log('No live audio input: ' + e);
    });
  };

  $(init)


//Recorder初始化以后调用
  function onRecorderReady() {
    // recorder.configure({onMp3Blob:(blob)=>console.log("onMp3Blob",blob)})
    // recorder.configure({onMp3Url:(url)=>console.log("onMp3Url",url)})
    recorder.configure({onMp3Blob:_onMp3Blob})
    recorder.configure({onMp3Url:_onMp3Url})
  }

  function _onMp3Blob(blob){//upload
    var reader = new FileReader();
    reader.onload = function(event){
      var fd = new FormData();
      var mp3Name = encodeURIComponent('audio_recording_' + new Date().getTime() + '.mp3');
      console.log("mp3name = " + mp3Name);
      fd.append('fname', mp3Name);
      fd.append('data', event.target.result);
      $.ajax({
        type: 'POST',
        url: 'upload.php',
        data: fd,
        processData: false,
        contentType: false
      }).done(function(data) {
        //console.log(data);
        log.innerHTML += "\n" + data;
      });
    };
    reader.readAsDataURL(blob);
  }

  function _onMp3Url(url){//ui link
      var li = document.createElement('li');
        var au = document.createElement('audio');
        var hf = document.createElement('a');
        au.controls = true;
        au.src = url;
        hf.href = url;
        hf.download = 'audio_recording_' + new Date().getTime() + '.mp3';
        hf.innerHTML = hf.download;
        li.appendChild(au);
        li.appendChild(hf);
        recordingslist.appendChild(li);
  }