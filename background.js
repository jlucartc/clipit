function create_clip(tab_id){
    chrome.tabs.sendMessage(
        tab_id,
        {msg: 'create_clip'}
    )
}

function jump_to_moment(start,link){
    chrome.tabs.query({url: link})
    .then(tabs => {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(
                tab.id,
                {msg: 'jump_to_moment', start: start}
            )
        })
    })
}

function increase_badge(){
    chrome.action.getBadgeText({},(text) => {
        let new_text = '1'
        if(text != ''){
            new_text = (parseInt(text)+1).toString()
        }
        chrome.action.setBadgeText({text: new_text})
    })
}

function decrease_badge(){
    chrome.action.getBadgeText({},(text) => {
        let new_text = '0'
        if(text != ''){
            if(text != '0'){
                new_text = (parseInt(text)-1).toString()
            }else{
                new_text = null
            }
            chrome.action.setBadgeText({text: new_text})
        }
    })
}

chrome.runtime.onConnect.addListener((conn) => {
    conn.onMessage.addListener((msg,port) => {
        let content = msg.msg
        switch(content){
            case 'increase_badge':
                increase_badge()
                break;
            case 'decrease_badge':
                decrease_badge()
                break;
            case 'jump_to_moment':
                jump_to_moment(msg.start,msg.link)
                break;
            default:
                break;
        }
    })
})

chrome.contextMenus.create({id: 'create_clip',title: 'Create clip'})
chrome.contextMenus.onClicked.addListener((info,tab) => {
    console.log('Tab: ',tab)
    switch(info.menuItemId){
        case 'create_clip':
            create_clip(tab.id)
            break;
        default:
            break;
    }
})

chrome.commands.onCommand.addListener((command,tab) => {
    switch(command){
        case 'create_clip':
            create_clip(tab.id)
            break;
        default:
            break;
    }
})
