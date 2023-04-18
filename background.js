function create_clip(){
    chrome.tabs.query({active: true},(tabs) => {
        chrome.tabs.sendMessage(
            tabs[0].id,
            {msg: 'create_clip'}
        )
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
    conn.onMessage.addListener((msg) => {
        let content = msg.msg
        switch(content){
            case 'increase_badge':
                increase_badge()
                break;
            case 'decrease_badge':
                decrease_badge()
                break;
            default:
                break;
        }
    })
})

chrome.contextMenus.create({id: 'create_clip',title: 'Create clip'})
chrome.contextMenus.onClicked.addListener((info,tab) => {
    switch(info.menuItemId){
        case 'create_clip':
            create_clip()
            break;
        default:
            break;
    }
})

chrome.commands.onCommand.addListener((command) => {
    switch(command){
        case 'create_clip':
            create_clip()
            break;
        default:
            break;
    }
})
