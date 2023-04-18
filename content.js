function create_clip(){
    let video = document.querySelector('video')

    if(video == undefined){
        video = Array.from(document.querySelectorAll('iframe')).map((iframe) => {
            return iframe.contentDocument.querySelector('video')
        }).pop()
    }

    let url = window.location.href
    let end = parseFloat(video.currentTime)
    let name = document.querySelector('title').innerText
    
    if(name == null){
        name = 'Clip'
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

        add_new_clip(name,url,start,end)
        increase_badge()
    })
}

function add_new_clip(name,url,start,end){
    chrome.storage.local.get(['clips'],(data) => {
        let clips = data['clips']
        if(data.hasOwnProperty('clips')){
            clips.push({
                id: clips.length,
                name: name,
                url: url,
                start: start,
                end: end
            })
        }else{
            clips = [{
                id: 0,
                name: name,
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
        default:
            break;
    }
})