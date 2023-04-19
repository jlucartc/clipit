function format_time(time){
    let parts = time.replace('Start: ','').split(':')
    let seconds = parseInt(parts[2])
    let minutes = parseInt(parts[1]) * 60
    let hours = parseInt(parts[0]) * 3600
    return seconds+minutes+hours
}

function jump_to_moment(start){
    let video = document.querySelector('video')

    if(video == undefined){
        video = Array.from(document.querySelectorAll('iframe')).map((iframe) => {
            return iframe.contentDocument.querySelector('video')
        }).pop()
    }
    
    video.currentTime = format_time(start)
}

function create_clip(){
    let video = document.querySelector('video')

    if(video == undefined){
        video = Array.from(document.querySelectorAll('iframe')).map((iframe) => {
            return iframe.contentDocument.querySelector('video')
        }).pop()
    }

    let url = window.location.href
    let end = parseFloat(video.currentTime)
    let title = document.querySelector('title').innerText
    
    if(title == null){
        title = 'Clip'
    }
    
    chrome.storage.local.get(['clip_range'],(data) => {
        let clip_range = 60
        let start = 0

        if(data.hasOwnProperty('clip_range')){
            clip_range = parseInt(data['clip_range'])
        }


        if(end - clip_range > 0){
            start = end - clip_range
        }

        add_new_clip(title,url,start,end)
        increase_badge()
    })
}

function add_new_clip(title,url,start,end){
    chrome.storage.local.get(['clips'],(data) => {
        let clips = data['clips']
        if(data.hasOwnProperty('clips')){
            clips.push({
                id: clips.length,
                title: title,
                name: 'New clip '+(clips.length+1),
                url: url,
                start: start,
                end: end
            })
        }else{
            clips = [{
                id: 0,
                title: title,
                name: 'New clip 1',
                url: url,
                start: start,
                end: end
            }]
        }
        chrome.storage.local.set({clips: clips})
    })
}

function increase_badge(){
    conn.postMessage({msg: 'increase_badge'})
}

let conn = chrome.runtime.connect({name: "connection"})

chrome.storage.local.set({clip_range: 60})

chrome.runtime.onMessage.addListener((msg) => {
    let content = msg.msg
    switch(content){
        case 'create_clip':
            create_clip()
            break;
        case 'jump_to_moment':
            jump_to_moment(msg.start)
            break;
        default:
            break;
    }
})