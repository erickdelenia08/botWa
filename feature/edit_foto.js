const axios = require('axios');
const { API_KEY_RM_BG } = require('../config');
const FormData = require('form-data');



const EditPhotoHandler = async (text, msg) => {
    const cmd = text.split('/');
    if (cmd.length < 2) {
        return msg.reply('Format Salah. ketik *edit_bg/warna*');
    }

    if (msg.hasMedia) {
        if (msg.type != 'image') {
            // console.log(msg);
            return msg.reply('hanya bisa edit dengan format image.');
        }

        msg.reply('sedang diproses, tunggu bentar ya '+msg._data.notifyName);

        const media = await msg.downloadMedia();

        if (media) {
            const color = cmd[1];
            const binaryData = Buffer.from(media.data, 'base64');
            const newPhoto = await EditPhotoRequest(binaryData, color)

            if (!newPhoto.success) {
                return msg.reply('Terjadi kesalahan.');
            }

            const chat = await msg.getChat();
            media.data = newPhoto.base64;
            chat.sendMessage(media, { caption: 'ini hasilnya..' })
            console.log(media)
        }
    }
}

async function EditPhotoRequest(base64, bg_color) {

    const result = {
        success: false,
        base64: null,
        message: "",
    }
    const formData = new FormData();
    formData.append('size', 'auto');
    formData.append('bg_color', bg_color);
    formData.append('image_file', base64);

    return await axios({
        method: 'post',
        url: 'https://api.remove.bg/v1.0/removebg',
        data: formData,
        responseType: 'arraybuffer',
        headers: {
            ...formData.getHeaders(),
            'X-Api-Key': API_KEY_RM_BG,
        },
        encoding: null,
    })
        .then((response) => {
            if (response.status == 200) {
                result.success = true;
                const bf = Buffer.from(response.data)
                result.base64 = bf.toString("base64")
                result.message = "berhasil...";
            } else {
                result.message = "Failed response";
            }

            return(result);
        })
        .catch((error) => {
            result.message = "Error : " + error.message;
            console.log(error);
            return result;
        });

}


module.exports = {
    EditPhotoHandler
}