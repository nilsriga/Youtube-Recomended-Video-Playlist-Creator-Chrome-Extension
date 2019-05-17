const appKey = "AIzaSyB-S6hUfMYheehP7dQZ87oR9LC_f5DS-SU"
var channelId;
var playlistId;
var linkIds;
var currentUrl
var latestPlaylistVideoId;
var index = 0;



chrome.browserAction.onClicked.addListener(function () {



    // get's active tab url
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        currentUrl = tabs[0].url;
    });
    // end of getting active url




    //This redirects to youtube or refreshes page
    setTimeout(function () {

        if (currentUrl != "https://www.youtube.com/" && currentUrl != "https://youtube.com/") {
            chrome.tabs.create({ url: 'https://www.youtube.com/' }, function () {
                chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

                    if (changeInfo.status == 'complete' && (tab.url == "https://www.youtube.com/" || tab.url == "https://youtube.com/")) {

                        chrome.tabs.executeScript({ file: 'jquery.js' });
                        chrome.tabs.executeScript({ file: 'scraper.js' })

                        chrome.tabs.onUpdated.removeListener(arguments.callee);
                    }

                })
            });


        } else {

            chrome.tabs.executeScript({ file: 'jquery.js' });
            chrome.tabs.executeScript({ file: 'scraper.js' });

        }

    }, 20);

    // end of redirecting or refreshing script





    // this listens for message from scraper.js
    chrome.runtime.onMessage.addListener(function (message) {
        chrome.runtime.onMessage.removeListener(arguments.callee);




        // this parses recomended links from scraper.js
        var messageObject = JSON.parse(message);

        channelId = messageObject.channelId;
        linkIds = messageObject.linkIds;


        console.log("Channel ID:" + channelId);
        console.log("link IDs: " + linkIds);
        console.log("First ID: " + linkIds[0]);
        // end of scraper.js parser








        // this authorizes requests
        chrome.identity.getAuthToken({ interactive: true }, function (token) {

            // This is a GET reques to get "TV" playlist's id
            let gettingTvPlaylistId = {
                method: 'GET',
                async: true,
                headers: {
                    Authorization: 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
            };

            fetch(
                'https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=' + channelId + '&key=' + appKey,
                gettingTvPlaylistId
            )
                .then((response) => response.json())
                .then(function (data) {
                    console.log(data)

                    var playlists = data.items;
                    var tvPlaylist = $.grep(playlists, function (playlist) {
                        return playlist.snippet.title == "TV"
                    })

                    if (tvPlaylist.length !== 0) {

                        var tvPlaylistId = tvPlaylist[0].id;
                        playlistId = tvPlaylistId;

                        console.log("tvPlaylistId: " + playlistId)
                        console.log("Inserting videos")

                        checkVideos();

                    } else {
                        createPlaylist();
                        console.log("creating Playlist")
                    }

                    console.log("playlist ID is: " + playlistId);
                    console.log("tvPlaylist ID is: " + tvPlaylistId);

                }
                );
            // end of GET request to get "TV" playlist's id



            // filter videos which don't exist in playlist
            function checkVideos() {
            let gettingTvPlaylistItems = {
                method: 'GET',
                async: true,
                headers: {
                    Authorization: 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
            };

            fetch(
                'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=' + playlistId + '&key=' + appKey,
                gettingTvPlaylistItems
            )
                .then((response) => response.json())
                .then(function (data) {
                    console.log(data)

                    if (data.items.length != 0) {

                        var videos = data.items;

                        var videoIds = videos.map(function (video) {
                            return video.snippet.resourceId.videoId;
                        })

                        console.log("link Ids before filtering: " + linkIds);

                        var filteredVideoIds = linkIds.filter(video => !videoIds.includes(video));
                        linkIds = filteredVideoIds;

                        
                        console.log("filtered: " + filteredVideoIds);
                        console.log("linksIds: " + linkIds);
                        
                        insertVideos(index);
                    }

                })
            }
            // end of filter videos which don't exist in playlist






            // This is a POST request to create a playlist
            function createPlaylist() {

                let creatingPlaylistRequest = {
                    method: 'POST',
                    async: true,
                    headers: {
                        Authorization: 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "snippet": {
                            "title": "TV",
                            "defaultLanguage": "en"
                        },
                        "status": { "privacyStatus": "private" }
                    }),
                    'contentType': 'json'
                };

                fetch(
                    'https://www.googleapis.com/youtube/v3/playlists?part=snippet%2Cstatus&key=' + appKey,
                    creatingPlaylistRequest
                )
                    .then((response) => response.json())
                    .then(function (data) {
                        console.log(data)

                        playlistId = data.id;
                        console.log("playlist ID is: " + playlistId);

                        insertVideos();

                    }
                    );
            }
            // // end of create playlist POST request



            // // these are POST requests to insert videos in said playlist

            function insertVideos(i) {

                if (linkIds.length == i) {
                    getLatestPlaylistVideoId()
                } else {

                    var link = linkIds[index];
                    index++

                    let insertingVideoRequest = {
                        method: 'POST',
                        async: true,
                        headers: {
                            Authorization: 'Bearer ' + token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            "snippet": {
                                "playlistId": playlistId,
                                "position": 0,
                                "resourceId": {
                                    "kind": "youtube#video",
                                    "videoId": link
                                }
                            }
                        })
                    };

                    fetch(
                        'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&key=' + appKey,
                        insertingVideoRequest
                    )
                        .then(response => {
                            if (response.status != 200) {
                                return console.log("something failed: ", response.status)
                            } else {
                                return response.json()
                            }
                        })
                        .then(function (data) {
                            console.log(data)
                            insertVideos(index);
                        }
                        ).catch((error) => {
                            alert("this extension failed: " + error)
                            index + linkIds.length;
                        });
                }
            }
            // end of POST requests to insert videos in playlist





            // This is a GET request to find out what is the video id of the latest video in TV playlist
            function getLatestPlaylistVideoId() {

                let request = {
                    method: 'GET',
                    async: true,
                    headers: {
                        Authorization: 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                };

                fetch(
                    'https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=' + playlistId + '&key=' + appKey,
                    request
                )
                    .then((response) => response.json())
                    .then(function (data) {
                        console.log(data)

                        latestPlaylistVideoId = data.items[0].contentDetails.videoId;

                        redirectsToFirstVideo();

                        console.log(latestPlaylistVideoId);

                    }
                    );
            }
            // end of script finding out what is the latest video in TV playlist




            // this redirects to playlists first video
            function redirectsToFirstVideo() {

                chrome.tabs.update({ url: 'https://www.youtube.com/watch?v=' + latestPlaylistVideoId + '&list=' + playlistId });

            }
            // end of redirect to playlist first video

        });
        // end of auth
    });
    // end of message listener from scraper.js
})
// end of clicked on addon listener

