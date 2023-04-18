function format_clips_as_text(clips){
    clips = clips.map((clip) => {
        clip = '----------\n\n'
                +'Start: '+format_time(clip.start)
                +'\nEnd: '+format_time(clip.end)
                +'\nName: '+clip.name.toString()
                +'\nURL: '+clip.url.toString()
                +'\n\n----------\n\n'
        return clip
    })
    clips = clips.reduce((total,part) => { return total + part }) 
    return clips
}

function format_clips_as_json(clips){
    clips = clips.map((clip) => {
        clip.start = format_time(clip.start)
        clip.end = format_time(clip.end)
        delete clip.id
        return clip
    })

    return JSON.stringify(clips)
}

function format_time(time){
    let hours = parseInt(parseInt(time)/3600)
    let minutes = parseInt((parseInt(time) - (hours*3600))/60)
    let seconds = parseInt(parseInt(time) - (minutes*60 + hours*3600))
    
    if(hours < 10){
        hours = hours.toString().padStart(2,'0')
    }

    if(minutes < 10){
        minutes = minutes.toString().padStart(2,'0')
    }

    if(seconds < 10){
        seconds = seconds.toString().padStart(2,'0')
    }

    return hours+':'+minutes+':'+seconds
}

function download_data(){
    let clips_data_format = document.querySelector('.clip-format-group__select')
    let file_type = 'text/plain'
    let file_name = 'clips.txt'
    chrome.storage.local.get(['clips'],(data) => {
        if(data.hasOwnProperty('clips')){
            switch(clips_data_format.value){
                case 'json':
                    data['clips'] = format_clips_as_json(data['clips'])
                    file_type = 'application/json'
                    file_name = 'clips.json'
                    break;
                case 'text':
                    data['clips'] = format_clips_as_text(data['clips'])
                    break;
                default:
                    data['clips'] = format_clips_as_json(data['clips'])
                    break;
            }
        }
        let blob = new Blob([data['clips']],{type: file_type})
        let file = new File([blob],file_name,{type: file_type})
        let download_link = document.createElement('a')
        download_link.download = file_name
        download_link.href = URL.createObjectURL(file)
        download_link.target = '_blank'
        download_link.style.display = 'none'
        document.body.append(download_link)
        download_link.click()
        download_link.parentElement.removeChild(download_link)
    })
}

function copy_data_to_clipboard(){
    chrome.storage.local.get(['clips'],(data) => {
        if(data.hasOwnProperty('clips')){
            let clips_data_format = document.querySelector('.clip-format-group__select')
            switch(clips_data_format.value){
                case 'json':
                    data['clips'] = format_clips_as_json(data['clips'])
                    break;
                case 'text':
                    data['clips'] = format_clips_as_text(data['clips'])
                    break;
                default:
                    data['clips'] = format_clips_as_json(data['clips'])
                    break;
            }
        }
        let file = new Blob([data['clips']],{type: 'text/plain'})
        navigator.clipboard.write([new ClipboardItem({'text/plain': file})])
    })
}

function remove_item(){
    chrome.storage.local.get(['clips'],(data) => {
        if(data.hasOwnProperty('clips')){
            data['clips'] = data['clips'].filter((clip) => {
                return clip.id.toString() != this.id.toString()
            })
            chrome.storage.local.set({clips: data['clips']},() => {
                decrease_badge()
            })
        }
    })
}

function decrease_badge(){
    connection.postMessage({msg: 'decrease_badge'})
}

function generate_clips_list(clips){
    let clips_list = document.querySelector('.clips__list')

    Array.from(clips_list.children).forEach((child) => {
        clips_list.removeChild(child)
    })

    clips.map((clip) => {
        let clips_list_item = document.createElement('div')
        let clips_list_item_name = document.createElement('div')
        let clips_list_item_url = document.createElement('a')
        let clips_list_item_time = document.createElement('div')
        let clips_list_item_time_start = document.createElement('div')
        let clips_list_item_time_end = document.createElement('div')
        let clips_list_item_controls = document.createElement('div')
        let clips_list_item_controls_remove = document.createElement('button')
    
        clips_list_item.id = clip['id']
        clips_list_item.className = 'clips-list__item'
        clips_list_item_name.className = 'clips-list-item__name'
        clips_list_item_url.className = 'clips-list-item__url'
        clips_list_item_time.className = 'clips-list-item__time'
        clips_list_item_time_start.className = 'clips-list-item-time__start'
        clips_list_item_time_end.className = 'clips-list-item-time__end'
        clips_list_item_controls.className = 'clips-list-item__controls'
        clips_list_item_controls_remove.className = 'clips-list-item-controls__remove'
        clips_list_item_controls_remove.innerHTML = 'Remove'
    
        clips_list_item_name.innerHTML = clip['name']
        clips_list_item_url.innerHTML = clip['url']
        clips_list_item_url.href = clip['url']
        clips_list_item_time_start.innerHTML = 'Start: '+format_time(clip['start'])
        clips_list_item_time_end.innerHTML = 'End: '+format_time(clip['end'].toString())

        clips_list_item_controls.append(clips_list_item_controls_remove)
        clips_list_item.append(clips_list_item_name)
        clips_list_item.append(clips_list_item_url)
        clips_list_item_time.append(clips_list_item_time_start)
        clips_list_item_time.append(clips_list_item_time_end)
        clips_list_item.append(clips_list_item_time)
        clips_list_item.append(clips_list_item_controls)
    
        clips_list_item_controls_remove.addEventListener('click',remove_item.bind(clips_list_item))        

        clips_list.append(clips_list_item)
    })
}

function create_list_item(name,url,start,end){
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
        chrome.storage.local.set({clips: clips},() => {
            generate_clips_list(clips)
        })
    })
}

function update_format_type(e){
    chrome.storage.local.set({format_type: e.target.value})
}

function update_clip_range_value(e){
    let new_value = parseInt(e.target.value)
    if(new_value != NaN){
        chrome.storage.local.set({clip_range: new_value})
    }
}

chrome.storage.onChanged.addListener((changes,area_name) => {
    if(changes.hasOwnProperty('clips')){
        generate_clips_list(changes['clips'].newValue)
    }
})

let connection = chrome.runtime.connect({name: 'popup'})
let clip_range_input = document.querySelector('.clip-range-group__input')
let clip_format_select = document.querySelector('.clip-format-group__select')
let copy_data_button = document.querySelector('.clips-copy-data__button')
let download_data_button = document.querySelector('.clips-download-data__button')
clip_range_input.addEventListener('keyup',update_clip_range_value)
clip_format_select.addEventListener('change',update_format_type)
copy_data_button.addEventListener('click',copy_data_to_clipboard)
download_data_button.addEventListener('click',download_data)

chrome.storage.local.get(['clip_range','clips','format_type'],(data) => {
    if(data.hasOwnProperty('clip_range')){
        clip_range_input.value = data['clip_range']
    }

    if(data.hasOwnProperty('clips')){
        generate_clips_list(data['clips'])
    }

    if(data.hasOwnProperty('format_type')){
        clip_format_select.value = data['format_type']
    }
})