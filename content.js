window.addEventListener('load', async () => {
    const actionsAndConditions = await fetchActionsAndConditions();
    console.log('actionsAndConditions:', actionsAndConditions);
    checkMessagesLoop(actionsAndConditions);
}, false);

const findFirstUnreadSms = () => document?.querySelector('.text-content.unread');
const readName = (sms) => sms?.querySelector('[data-e2e-conversation-name]')?.textContent;
const readSnippet = (sms) => sms?.querySelector('[data-e2e-conversation-snippet]')?.textContent;

function checkMessagesLoop(actionsAndConditions) {
    setTimeout(async () => {
        const firstUnreadSms = findFirstUnreadSms();
        if (firstUnreadSms) {
            const name = readName(firstUnreadSms);
            const snippet = readSnippet(firstUnreadSms);
            if (name && snippet) {

                await checkConditionsAndDoActions(actionsAndConditions, name, snippet);

                alert(name + ':\r\n' + snippet);
            }
        } else
            checkMessagesLoop(actionsAndConditions);
    }, 1000);
}

async function fetchActionsAndConditions() {
    try {
        const response = await fetch(chrome.runtime.getURL('actions_conditions.json'));
        if (!response.ok) throw new Error('Network error: ' + response.statusText);
        return await response.json();
    } catch (error) {
        console.error('fetchActionsAndConditions error:', error);
    }
}

async function checkConditionsAndDoActions(actionsAndConditions, name, snippet) {
    if (actionsAndConditions.conditions.every(condition => checkCondition(condition, name, snippet))) {
        await Promise.all(actionsAndConditions.actions.map(async action => await doAction(action, name, snippet)));
    }
}

function checkCondition(condition, name, snippet) {
    switch (condition.type) {
        case 'title':
            return check(condition, name);
        case 'snippet':
            return check(condition, snippet);
        default:
            console.error('Unknown condition type:', condition.type);
            return false;
    }
}

function check(condition, text) {
    switch (condition.operator) {
        case 'equals':
            return text === condition.value;
        case 'startsWith':
            return text?.startsWith(condition.value) || false;
        case 'includes':
            return text?.includes(condition.value) || false;
        default:
            console.error('Unknown condition operator:', condition.operator);
            return false;
    }
}

async function doAction(action, name, snippet) {
    switch (action.method) {
        case 'post':
            return await post(action, name, snippet);
        case 'get':
            return await get(action, name, snippet);
        default:
            console.error('Unknown action method:', action.method);
            return false;
    }
}

async function post(action, name, snippet) {
    const formData = new FormData();
    for (const key in action.params) {
        formData.append(
            key, 
            params[key]?.replace('%%TITLE%%', name)?.replace('%%SNIPPET%%', snippet));
    }
    return await fetch(action.url, {
        method: 'POST',
        body: formData
    });
}

async function get(action, name, snippet) {
    const url = new URL(action.url);
    for (const key in action.params) {
        url.searchParams.append(
            key, 
            params[key]?.replace('%%TITLE%%', name)?.replace('%%SNIPPET%%', snippet));
    }
    return await fetch(url);
}
