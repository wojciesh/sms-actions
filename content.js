window.addEventListener('load', checkMessages, false);

const findFirstUnreadSms = () => document?.querySelector('.text-content.unread');
const readName = (sms) => sms?.querySelector('[data-e2e-conversation-name]')?.textContent;
const readSnippet = (sms) => sms?.querySelector('[data-e2e-conversation-snippet]')?.textContent;

function checkMessages() {
    setTimeout(() => {
        const firstUnreadSms = findFirstUnreadSms();
        if (firstUnreadSms) {
            const unreadName = readName(firstUnreadSms);
            const snippet = readSnippet(firstUnreadSms);
            if (unreadName && snippet) {
                alert(unreadName + ':\r\n' + snippet);
            }
        } else
            checkMessages();
    }, 1000);
}
