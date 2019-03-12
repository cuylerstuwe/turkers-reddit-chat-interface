const request = require('request-promise');
const colors = require('colors');
const minimist = require('minimist');

const secrets = require('./secrets');

const args = require('minimist')(process.argv.slice(2));

async function main() {

    var options = {
        method: 'GET',
        url: 'https://sendbirdproxy-03ff847212a8b1175.chat.redditmedia.com/v3/group_channels/sendbird_group_channel_7308797_b0bcd5ad6b2df37866f21e2ef14391566c42f1b4/messages',
        qs: {
            is_sdk: 'true',
            message_ts: `${Date.now()}`,
            prev_limit: `${args.n || "200"}`,
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
            .map(message => ({user: message.user.nickname, text: message.message, time: new Date(message.created_at)}))
            .sort((a, b) => a.created_at < b.created_at ? 1 : -1)
    );

    messages.forEach(message => {
        console.log(`${message.time.toLocaleString("en-US").gray} ${message.user.blue}: ${message.text.green}`);
    });
}

main();