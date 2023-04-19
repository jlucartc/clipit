function format_clips_as_text(clips){
    clips = clips.map((clip) => {
        clip = '----------\n\n'
                +'Name: '+clip.name.toString()
                +'\nStart: '+format_time(clip.start)
                +'\nEnd: '+format_time(clip.end)
                +'\nTitle: '+clip.title.toString()
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

function jump_to_moment(){
    let start = this.innerText.match(/Start:\s[0-9]{2,}:[0-9]{2,2}:[0-9]{2,2}/)
    let link = this.querySelector('.clips-list-item__url').href
    if(start != null){
        connection.postMessage({msg: 'jump_to_moment', start: start[0], link: link})
    }
}

function decrease_badge(){
    chrome.action.getBadgeText({})
    .then(text => {
        chrome.action.setBadgeText({text: (parseInt(text) - 1).toString()})
    })
}

function clear_badge(){
    chrome.action.setBadgeText({text: '0'})
}

function generate_clips_list(clips){
    let clips_list = document.querySelector('.clips')

    Array.from(clips_list.children).forEach((child) => {
        clips_list.removeChild(child)
    })

    clips.reverse().map((clip) => {
        let clips_list_item = document.createElement('div')
        let clips_list_item_video_name = document.createElement('div')
        let clips_list_item_url = document.createElement('a')
        let clips_list_item_time = document.createElement('div')
        let clips_list_item_time_start = document.createElement('div')
        let clips_list_item_time_end = document.createElement('div')
        let clips_list_item_controls = document.createElement('div')
        let clips_list_item_controls_remove = document.createElement('button')
        let clips_list_item_controls_jump = document.createElement('button')
        let clips_list_item_name_group_clip_name_group = document.createElement('div')
        let clips_list_item_name_group_clip_name_group_label = document.createElement('label')
        let clips_list_item_name_group_edit_name_group = document.createElement('div')
        let clips_list_item_name_group_edit_name_group_input = document.createElement('input')
        let clips_list_item_name_group_clip_name_group_edit = document.createElement('button')
        let clips_list_item_name_group_edit_name_group_save = document.createElement('button')
        let clips_list_item_name_group_edit_name_group_cancel = document.createElement('button')

        clips_list_item.id = clip['id']
        clips_list_item.className = 'clips-list__item'
        clips_list_item_video_name.className = 'clips-list-item__video-name'
        clips_list_item_url.className = 'clips-list-item__url'
        clips_list_item_time.className = 'clips-list-item__time'
        clips_list_item_time_start.className = 'clips-list-item-time__start'
        clips_list_item_time_end.className = 'clips-list-item-time__end'
        clips_list_item_controls.className = 'clips-list-item__controls'
        clips_list_item_controls_remove.className = 'clips-list-item-controls__remove'
        clips_list_item_controls_remove.innerHTML = 'Remove'
        clips_list_item_controls_jump.className = 'clips-list-item-controls__jump'
        clips_list_item_controls_jump.innerHTML = 'Go to'
        clips_list_item_name_group_clip_name_group.className = 'clips-list-item-name-group__clip-name-group'
        clips_list_item_name_group_clip_name_group_label.className = 'clips-list-item-name-group-clip-name-group__label'
        clips_list_item_name_group_clip_name_group_edit.className = 'clips-list-item-name-group-clip-name-group__edit'
        clips_list_item_name_group_edit_name_group.className = 'clips-list-item-name-group__edit-name-group'
        clips_list_item_name_group_edit_name_group_input.className = 'clips-list-item-name-group-edit-name-group__input'
        clips_list_item_name_group_edit_name_group_save.className = 'clips-list-item-name-group-edit-name-group__save'
        clips_list_item_name_group_edit_name_group_cancel.className = 'clips-list-item-name-group-edit-name-group__cancel'
        clips_list_item_name_group_clip_name_group_edit.innerHTML = 'Edit'
        clips_list_item_name_group_edit_name_group_save.innerHTML = 'Save'
        clips_list_item_name_group_edit_name_group_cancel.innerHTML = 'Cancel'
        clips_list_item_name_group_clip_name_group_label.innerHTML = clip.name
        clips_list_item_name_group_edit_name_group_input.value = clip.name
        clips_list_item_name_group_edit_name_group.style.display = 'none'

        clips_list_item_video_name.innerHTML = clip.title
        clips_list_item_url.innerHTML = clip.url
        clips_list_item_url.href = clip.url
        clips_list_item_time_start.innerHTML = 'Start: '+format_time(clip.start)
        clips_list_item_time_end.innerHTML = 'End: '+format_time(clip.end)

        clips_list_item_name_group_clip_name_group.append(clips_list_item_name_group_clip_name_group_label)
        clips_list_item_name_group_clip_name_group.append(clips_list_item_name_group_clip_name_group_edit)
        clips_list_item_name_group_edit_name_group.append(clips_list_item_name_group_edit_name_group_input)
        clips_list_item_name_group_edit_name_group.append(clips_list_item_name_group_edit_name_group_cancel)
        clips_list_item_name_group_edit_name_group.append(clips_list_item_name_group_edit_name_group_save)
        clips_list_item_controls.append(clips_list_item_controls_jump)
        clips_list_item_controls.append(clips_list_item_controls_remove)
        clips_list_item.append(clips_list_item_name_group_clip_name_group)
        clips_list_item.append(clips_list_item_name_group_edit_name_group)
        clips_list_item.append(clips_list_item_video_name)
        clips_list_item.append(clips_list_item_url)
        clips_list_item_time.append(clips_list_item_time_start)
        clips_list_item_time.append(clips_list_item_time_end)
        clips_list_item.append(clips_list_item_time)
        clips_list_item.append(clips_list_item_controls)
    
        clips_list_item_controls_remove.addEventListener('click',remove_item.bind(clips_list_item))        
        clips_list_item_controls_jump.addEventListener('click',jump_to_moment.bind(clips_list_item))
        clips_list_item_name_group_clip_name_group_edit.addEventListener('click',edit_clip_name.bind(clips_list_item))
        clips_list_item_name_group_edit_name_group_save.addEventListener('click',save_clip_name.bind(clips_list_item))
        clips_list_item_name_group_edit_name_group_cancel.addEventListener('click',cancel_clip_name_edit.bind(clips_list_item))

        clips_list.append(clips_list_item)
    })
}

function edit_clip_name(){
    let edit_clip_group = this.querySelector('.clips-list-item-name-group__edit-name-group')
    let clip_name_group = this.querySelector('.clips-list-item-name-group__clip-name-group')
    edit_clip_group.style.display = 'flex'
    clip_name_group.style.display = 'none'
}


function save_clip_name(){
    let edit_name_input = this.querySelector('.clips-list-item-name-group-edit-name-group__input')
    let edit_clip_group = this.querySelector('.clips-list-item-name-group__edit-name-group')
    let clip_name_group = this.querySelector('.clips-list-item-name-group__clip-name-group')
    chrome.storage.local.get('clips')
    .then(data => {
        if(data.hasOwnProperty('clips')){
            data.clips[this.id].name = edit_name_input.value
            chrome.storage.local.set({clips: data.clips})
            .then(() => {
                edit_clip_group.style.display = 'none'
                clip_name_group.style.display = 'flex'
            })
        }
    })
}

function cancel_clip_name_edit(){
    let name_label = this.querySelector('.clips-list-item-name-group-clip-name-group__label')
    let edit_name_input = this.querySelector('.clips-list-item-name-group-edit-name-group__input')
    let edit_clip_group = this.querySelector('.clips-list-item-name-group__edit-name-group')
    let clip_name_group = this.querySelector('.clips-list-item-name-group__clip-name-group')

    edit_name_input.value = name_label.innerText

    edit_clip_group.style.display = 'none'
    clip_name_group.style.display = 'flex'
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

function clear_list(){
    chrome.storage.local.clear()
    .then(() => {
        clear_badge()
    })
}

function filter_clips(e){
    let words = e.target.value.split(/\s/)
    let clips = Array.from(document.querySelector('.clips').children)

    console.log('words: ',words)

    clips.forEach(clip => {
        let match_any = false
        words.forEach(word => {
            if(clip.innerText.toLowerCase().match(word.toLowerCase()) != null){
                match_any = true
            }
        })
        clip.style.display = match_any ? 'flex' : 'none'
    })
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
let clear_list_button = document.querySelector('.clips-clear-list__button')
let search_input = document.querySelector('.clip-search__input')
clip_range_input.addEventListener('keyup',update_clip_range_value)
clip_format_select.addEventListener('change',update_format_type)
copy_data_button.addEventListener('click',copy_data_to_clipboard)
download_data_button.addEventListener('click',download_data)
clear_list_button.addEventListener('click',clear_list)
search_input.addEventListener('keyup',filter_clips)

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