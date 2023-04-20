
const socket = io('/')
const videoGrid = document.getElementById('video-grid')
let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true;

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    // to work on localhost give same port as server.js
    port: '3030'
    // port:'443'
    // peer works on 443
});

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream)

    peer.on('call', call => {
        call.answer(stream); // Answer the call with an A/V stream.
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        });
    });

    // socket.on('user-connected', (userId) => {
    //     connecToNewUser(userId, stream)
    // })
    // // when user connects

    socket.on("user-connected", (userId) => {
        console.log("user connected.,..........");
        //Adding timeout ensures that this code is pushed from main stack to event queue, which will be run later when main stack is completed.
        //Our earlier code was having an issue that without completing remote stream request, socket was sending connection info and trying to add video which was 
        setTimeout(function () {
            connecToNewUser(userId, stream);
        }, 5000
        )
    })

    let text = $('input')

    //listen to html or ejs file to listen to enter key
    $('html').keydown((e) => {
        if (e.which == 13 && text.val().length !== 0) {
            console.log(text.val())
            //sending msg from frontend
            socket.emit('message', text.val())
            text.val('')
        }
    })

    //listen to message from server.js
    socket.on('createMessage', message => {
        console.log('this is coming from server', message)
        $('ul').append(`<li class="message"><b>user</b><br/>${message}</li>`)
        scrollToBottom()
    })
})

peer.on('open', id => {
    console.log("Room Id at peer.on ", ROOM_ID)
    socket.emit('join-room', ROOM_ID, id)
})

const connecToNewUser = (userId, stream) => {
    console.log('new user', userId)
    const call = peer.call(userId, stream)
    // call other user and send my stream
    const video = document.createElement('video')
    // create video element for the other user
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    // when i recieve stream then addVideoStream runs
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

// when messages are send the window automatically scrolls to bottom 
const scrollToBottom=()=>{
    var d=$('.main_chat_window')
    d.scrollTop(d.prop("scrollHeight"))
}

//Mute our video
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      setUnmuteButton();
    } else {
      setMuteButton();
      myVideoStream.getAudioTracks()[0].enabled = true;
    }
  }

  const setMuteButton = () => {
    const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `
    document.querySelector('.main_mute_button').innerHTML = html;
  }
  
  const setUnmuteButton = () => {
    const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `
    document.querySelector('.main_mute_button').innerHTML = html;
  }


  const playStop = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      setPlayVideo()
    } else {
      setStopVideo()
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
  }

  const setStopVideo = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.main_video_button').innerHTML = html;
  }
  
  const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.main_video_button').innerHTML = html;
  }