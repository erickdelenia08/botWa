import qrcode from 'qrcode'
import whtsp from 'whatsapp-web.js';
const { Client, MessageMedia, LocalAuth } = whtsp;
import { EditPhotoHandler } from "./feature/edit_foto.js"
import { ChatAIHandler } from './feature/chat_ai.mjs'
import fs from 'fs';
import mime from 'mime-types';


import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;

import express from 'express';
const app = express();
import http from 'http';
const server = http.createServer(app);
import { Server } from "socket.io";
const io = new Server(server);


app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.get('/', (req, res) => {
    res.sendFile('index.html', {
        root: __dirname
    });
});


const client = new Client({
    authStrategy: new LocalAuth()
});


io.on('connection', function (socket) {
    console.log('socket connected');
    socket.emit('message', 'Connecting...');
    client.on('qr', qr => {
        qrcode.toDataURL(qr, (err, url) => {
            socket.emit('qr', url);
            socket.emit('message', 'QR Code received, scan please!');
        });
    });

    client.on('ready', () => {
        socket.emit('ready', 'Whatsapp is ready!');
        socket.emit('message', 'Whatsapp is ready!');
    });

    client.on('authenticated', () => {
        socket.emit('authenticated', 'Whatsapp is authenticated!');
        socket.emit('message', 'Whatsapp is authenticated!');
    });

    client.on('auth_failure', function (session) {
        socket.emit('message', 'Auth failure, restarting...');
    });

    client.on('disconnected', (reason) => {
        socket.emit('message', 'Whatsapp is disconnected!');
        client.destroy();
        client.initialize();
    });
});











client.on('message', async message => {
    const { body } = message;

    if (body.toLocaleLowerCase() === '!ping') {
        message.reply('pong');
    }
    // #edit_bg/bg_color
    if (body.toLocaleLowerCase().includes("#edit_bg/")) {
        await EditPhotoHandler(body, message);
    }
    // #ask/question?
    if (body.toLocaleLowerCase().includes("#ask/")) {
        await ChatAIHandler(body, message);
    }
    if (message.body === '-groupinfo') {
        let chat = await message.getChat();
        if (chat.isGroup) {
            message.reply(`
*Group Details*
Name: ${chat.name}
Description: ${chat.description}
Created At: ${chat.createdAt.toString()}
Created By: ${chat.owner.user}
Participant count: ${chat.participants.length}
            `);
        } else {
            message.reply('This command can only be used in a group!');
        }
    }

    if (message.body === '-sticker') {
        if (message.hasMedia) {
            message.downloadMedia().then(media => {

                if (media) {

                    const mediaPath = './downloaded-media/';

                    if (!fs.existsSync(mediaPath)) {
                        fs.mkdirSync(mediaPath);
                    }


                    const extension = mime.extension(media.mimetype);

                    const filename = new Date().getTime();

                    const fullFilename = mediaPath + filename + '.' + extension;

                    // Save to file
                    try {
                        fs.writeFileSync(fullFilename, media.data, { encoding: 'base64' });
                        console.log('File downloaded successfully!', fullFilename);
                        console.log(fullFilename);
                        MessageMedia.fromFilePath(fullFilename)
                        client.sendMessage(message.from, new MessageMedia(media.mimetype, media.data, filename), { sendMediaAsSticker: true, stickerAuthor: "Created By Bot", stickerName: "Stickers" })
                        fs.unlinkSync(fullFilename)
                        console.log(`File Deleted successfully!`,);
                    } catch (err) {
                        console.log('Failed to save the file:', err);
                    }
                }
            });
        } else {
            message.reply(`send image with caption *-sticker* `)
        }
    }

    // console.log(message);
});

client.initialize();


server.listen(port, function () {
    console.log('App running on *: ' + port);
});