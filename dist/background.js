!function(e){var t={};function o(n){if(t[n])return t[n].exports;var s=t[n]={i:n,l:!1,exports:{}};return e[n].call(s.exports,s,s.exports,o),s.l=!0,s.exports}o.m=e,o.c=t,o.d=function(e,t,n){o.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,t){if(1&t&&(e=o(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(o.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var s in e)o.d(n,s,function(t){return e[t]}.bind(null,s));return n},o.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(t,"a",t),t},o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o.p="",o(o.s=0)}([function(e,t){const o="AIzaSyB-S6hUfMYheehP7dQZ87oR9LC_f5DS-SU";var n,s,i,r,l,a=0;chrome.browserAction.onClicked.addListener(function(){chrome.tabs.query({active:!0,lastFocusedWindow:!0},function(e){r=e[0].url}),setTimeout(function(){"https://www.youtube.com/"!=r&&"https://youtube.com/"!=r?chrome.tabs.create({url:"https://www.youtube.com/"},function(){chrome.tabs.onUpdated.addListener(function(e,t,o){"complete"!=t.status||"https://www.youtube.com/"!=o.url&&"https://youtube.com/"!=o.url||(chrome.tabs.executeScript({file:"dist/jquery.js"}),chrome.tabs.executeScript({file:"dist/scraper.js"}),chrome.tabs.onUpdated.removeListener(arguments.callee))})}):(chrome.tabs.executeScript({file:"dist/jquery.js"}),chrome.tabs.executeScript({file:"dist/scraper.js"}))},20),chrome.runtime.onMessage.addListener(function(e){chrome.runtime.onMessage.removeListener(arguments.callee);var t=JSON.parse(e);n=t.channelId,i=t.linkIds,console.log("Channel ID:"+n),console.log("link IDs: "+i),console.log("First ID: "+i[0]),chrome.identity.getAuthToken({interactive:!0},function(e){function t(n){if(i.length==n)fetch("https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId="+s+"&key="+o,{method:"GET",async:!0,headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"}}).then(e=>e.json()).then(function(e){console.log(e),l=e.items[0].contentDetails.videoId,chrome.tabs.update({url:"https://www.youtube.com/watch?v="+l+"&list="+s}),console.log(l)});else{var r=i[a];a++;let n={method:"POST",async:!0,headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"},body:JSON.stringify({snippet:{playlistId:s,position:0,resourceId:{kind:"youtube#video",videoId:r}}})};fetch("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&key="+o,n).then(e=>200!=e.status?console.log("something failed: ",e.status):e.json()).then(function(e){console.log(e),t(a)}).catch(e=>{alert("this extension failed: "+e),i.length})}}fetch("https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId="+n+"&key="+o,{method:"GET",async:!0,headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"}}).then(e=>e.json()).then(function(n){console.log(n);var r=n.items,l=$.grep(r,function(e){return"TV"==e.snippet.title});if(0!==l.length){var c=l[0].id;s=c,console.log("tvPlaylistId: "+s),console.log("Inserting videos"),fetch("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId="+s+"&key="+o,{method:"GET",async:!0,headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"}}).then(e=>e.json()).then(function(e){if(console.log(e),0!=e.items.length){var o=e.items,n=o.map(function(e){return e.snippet.resourceId.videoId});console.log("link Ids before filtering: "+i);var s=i.filter(e=>!n.includes(e));i=s,console.log("filtered: "+s),console.log("linksIds: "+i),t(a)}})}else!function(){let n={method:"POST",async:!0,headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"},body:JSON.stringify({snippet:{title:"TV",defaultLanguage:"en"},status:{privacyStatus:"private"}}),contentType:"json"};fetch("https://www.googleapis.com/youtube/v3/playlists?part=snippet%2Cstatus&key="+o,n).then(e=>e.json()).then(function(e){console.log(e),s=e.id,console.log("playlist ID is: "+s),t()})}(),console.log("creating Playlist");console.log("playlist ID is: "+s),console.log("tvPlaylist ID is: "+c)})})})})}]);