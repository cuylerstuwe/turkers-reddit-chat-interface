const request = require('request-promise');
const colors = require('colors');
const minimist = require('minimist');

const secrets = require('./secrets');
const sendbirdKeys = require('./publicSendbirdKeys');

const args = require('minimist')(process.argv.slice(2));

const DEFAULTS = {
    MESSAGES_TO_FETCH: 200,
    MESSAGES_TO_POLL_BUFFER: 50,
    POLL_RATE_MS: 5000
}

String.prototype.singleLine = function() {
    return this.replace(/\n/mg, " ");
}

function printStyledMessage(message) {
    console.log(`${message.time.toLocaleString("en-US").gray} ${message.user.blue}: ${message.text.green}`);
}

async function fetchMessages(numberOfMessages) {

    const options = {
        method: 'GET',
        url: sendbirdKeys.fetchUrl,
        qs: {
            is_sdk: 'true',
            message_ts: `${Date.now()}`,
            prev_limit: `${numberOfMessages}`,
            next_limit: '0',
            include: 'false',
            reverse: 'true',
            message_type: 'MESG'
        },
        headers: {
            'cache-control': 'no-cache',
            'Session-Key': secrets.sessionKey
        }
    };

    const responseText = await request(options);
    const response = JSON.parse(responseText);
    const messages = (
        response.messages
            .map(message => ({
                user: message.user.nickname,
                text: message.message.singleLine(),
                time: new Date(message.created_at)})
            )
            .sort((a, b) => a.created_at < b.created_at ? 1 : -1)
    );

    return messages;
}

async function pollIndefinitely(pollRateMs) {

    const seenMessages = {};

    console.log(`Polling for messages every ${pollRateMs}...`.yellow);

    setInterval(async () => {
        const messages = await fetchMessages(DEFAULTS.MESSAGES_TO_POLL_BUFFER);
        messages.forEach(message => {
            const messageIdentifier = `${message.user}${message.time.toString()}`;
            if(seenMessages[messageIdentifier] === undefined) {
                printStyledMessage(message);
                seenMessages[messageIdentifier] = true;
            }
        });
    }, pollRateMs);
}

async function send(message) {

    const SendBird = require('sendbird');

    const sendbird = new SendBird({ appId: sendbirdKeys.appId });

    let groupChannel;

    await new Promise(resolve => {
        sendbird.connect(secrets.userId, secrets.accessToken, (_, err) => {
            sendbird.GroupChannel.getChannel(sendbirdKeys.channelId, (gc, err) => {
                groupChannel = gc;
                groupChannel.refresh(() => {
                    resolve();
                });
            });
        });
    });

    const messageParams = new sendbird.UserMessageParams();
    messageParams.message = message;

    const errorCode = await new Promise(resolve => {
        groupChannel.sendUserMessage(messageParams, (_, err) => { resolve(err); });
    });

    process.exit(errorCode ? 1 : 0);
}

async function main() {

    if(args.m) {
        await send(args.m);
        return;
    }
    else if(args.z) {
        pollIndefinitely(args.z || DEFAULTS.POLL_RATE_MS);
        return;
    }
    else {

        const messages = await fetchMessages(args.n || DEFAULTS.MESSAGES_TO_FETCH);

        messages.forEach(message => {
            printStyledMessage(message);
        });
    }

}

main();