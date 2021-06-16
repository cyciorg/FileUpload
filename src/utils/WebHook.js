const w = require('wumpfetch');
const isUrl = require('./isUrl');
const truncate = require('./truncate');
var mime = require('mime-types')
var isPicture = false;

async function sendWebhook(webhook, { title = "LOG - Default", color = "", info = "", picture = ""} = {}) {
  if (!webhook) throw new Error("WebHook empty.");
  if (!isUrl(webhook)) return;
  this.options = {title, color, info, picture}
  if (!this.options) throw new Error("Options null.");
  
  if (process.env.NODE_ENV == "development") return;
  if (this.options.picture != 0) {
    const fileExt = picture.substring(picture.lastIndexOf('.') + 1, picture.length).toLowerCase();
    let mimeType = mime.lookup(fileExt);
    if (mimeType.includes("png") || mimeType.includes("jpg") || mimeType.includes("jpeg") || mimeType.includes("gif")) {
      isPicture = true
    } else isPicture = false;
    await w({
      url: webhook,
      method: 'POST',
      headers: {
          'User-Agent': `Cyci CDN/FileUploader (${require('../../package.json').version}) 2021`
      },
  }).body({
    "embeds": [
      {
        "title": `${this.options.title}`,
        "url": "https://cyci.org",
        "description": `\`\`\`${truncate(this.options.info)}\`\`\``,
        "color": this.options.color,
        "thumbnail": (isPicture ? picture : null),
        "footer": {
          "text": `${new Date(Date.now())}`
        }
      }
    ]
  }).send();
  }
}
module.exports = sendWebhook;