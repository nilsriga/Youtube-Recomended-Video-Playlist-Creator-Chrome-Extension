
alert("Creating a playlist. Please wait 1-5 seconds. Don't switch tabs or windows.");

var linkIds = [];

$('.ytd-grid-renderer a.ytd-grid-video-renderer').each(function (i, element) {
    var linkSlug = $(this).attr('href');
    var linkId = linkSlug.substring(9);
    linkIds.push(linkId);
});

var DOM = new XMLSerializer().serializeToString(document);
var idString = DOM.match(/{"key":"creator_channel_id","value":"........................"}+?/);
var idObject = JSON.parse(idString[0]);
var channelId = idObject.value;


var messageObject = {};
messageObject.channelId = channelId;
messageObject.linkIds = linkIds;


chrome.runtime.sendMessage(JSON.stringify(messageObject));
// alert("channelId sent:" + JSON.stringify(messageObject))

