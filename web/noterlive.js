var lastSpeakerHTML = "";
var localstoragemustard = supports_html5_storage();
function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}



function storeLocal () {
	if ( false == localstoragemustard ) {
		return;
	}
	
	var forStorage = {
		screenname: document.querySelector("#profilename").innerText,
		lastSpeakerHTML: lastSpeakerHTML,
		blogpost: document.note.blogpost.value,
		archive: document.note.archive.value,
		hashtag: document.note.hashtag.value,
		speakerhandle: document.note.speakerhandle.value,
		speakertwitter: document.note.speakertwitter.value,
		speakername: document.note.speakername.value,
		speakerurl: document.note.speakerurl.value,
		speakerlink: document.getElementById( 'speakerlist' ).innerHTML
	}
	
	var forStorageString = JSON.stringify( forStorage );
	
	localStorage.setItem( 'noterliver', forStorageString );
}

function recoverLocal( screenname ) {
	if ( false == localstoragemustard ) {
		return;
	}
	
	var forStorageString = localStorage.getItem( 'noterliver' );

	if ( null == forStorageString ) {
		// got nothin' for you
		return;
	}
	
	var forStorage = JSON.parse( forStorageString );

	if ( screenname != forStorage.screenname ) {
		// no longer correct
		clearLocal();
		// head back to camp
		return;
	}
	
		
	var fields = ['blogpost','archive','hashtag','funk','speakerhandle','speakertwitter','speakername','speakerurl'];
	
	for ( var i=0,l=fields.length; i<l; i++ ) {
		console.log( 'fields', fields[i] );
		
		if ( typeof forStorage[fields[i]] == 'undefined' ) {
			continue;
		}
		
		if ( typeof document.note[fields[i]] == 'undefined' ) {
			continue;
		}
		
		
		document.note[fields[i]].value = forStorage[fields[i]];
	}
	
	document.getElementById( 'speakerlist' ).innerHTML = forStorage.speakerlink;
	lastSpeakerHTML = forStorage.lastSpeakerHTML;
}
function clearLogs() {
	var fields = ['blogpost','archive'];
	for ( var i=0,l=fields.length; i<l; i++ ) {
	    document.note[fields[i]].value = "";
	}

	document.getElementById( 'preview' ).innerHTML ="";
}
function clearSpeakers() {
	document.getElementById( 'speakerlist' ).innerHTML ="";
}
function clearThread() {
    document.getElementById("tweet").src="";
}

function clearLocal() {
	if ( false == localstoragemustard ) {
		return;
	}
	
	localStorage.removeItem( 'noterliver' );
}



function noteit() {
    var name = (document.note.speakertwitter.value)?" "+document.note.speakertwitter.value +": " :" ";
    document.note.composed.value = document.note.hashtag.value + name + document.note.quote.value;
    var rawcount = strlen(document.note.composed.value);
    var munged = tw_text_proxy(document.note.composed.value);
    var mungleft = 140-strlen(munged);
    var countElement= document.getElementById("charcount");
    var countColour = "black";
    
    countElement.innerHTML = mungleft;
    document.getElementById("tweetpre").innerHTML = munged.slice(0,140)
    if (mungleft<15) { countColour = "maroon";} 
    if (mungleft<5) { countColour = "darkorange";} 
    if (mungleft<0) { countColour = "red";} 
    countElement.style.backgroundColor = countColour;
    document.getElementById("notebutton").style.backgroundColor = countColour;
}
function getSpeakerHTML() {
    addHovercard = document.getElementById("hovercards").checked
    html = "<div class='notercite h-cite'>";
    if (addHovercard) {
        html = html+"<span class='hovercard'>";
    }
    html = html +"<a class='h-card p-category' href='" + document.note.speakerurl.value +"'>" + document.note.speakername.value + "</a>";
     if (addHovercard) {
    html = html+"<iframe class='u-hovercard hidden-info' height=128 width=256 src='http://www.unmung.com/hovercard?url=" + encodeURIComponent(document.note.speakerurl.value) +"'></iframe></span>";
    }
    html = html+": ";
    return html
}
function postit() {
    document.note.archive.value = document.note.archive.value + "\n" +document.note.composed.value;
    speakerHTML = getSpeakerHTML();
    if (speakerHTML == lastSpeakerHTML) {
        speakerHTML = "<p>"; // a new paragraph inside the blockquote
    } else {
        if (lastSpeakerHTML != "") { speakerHTML = "</blockquote></div>\n" + speakerHTML; }
        speakerHTML = speakerHTML + " <blockquote class='e-content'><p>";
        lastSpeakerHTML = getSpeakerHTML();
    }            
    document.note.blogpost.value = document.note.blogpost.value + "\n" +speakerHTML + auto_link(document.note.quote.value, true);
    document.getElementById("preview").innerHTML = document.note.blogpost.value;
    var lastid = "0";
    var firstlink = null;
    try {
       firstlink = document.getElementById('tweet').contentDocument.getElementsByTagName("a")[0]
    } catch (except) {
        console.log("no tweet iframe" + except);
    }
    if (firstlink) {lastid= firstlink.href.split('/').pop();}
    document.getElementById("tweet").src='/sendtweet?status='+encodeURIComponent(document.note.composed.value)+"&lastid="+encodeURIComponent(lastid);
    document.note.quote.value = "";
    noteit(); //fix counter and button colour
    storeLocal();
}
function changespeakerinfo() {
    handle=document.note.speakerhandle.value;
        req = new XMLHttpRequest();
        req.onreadystatechange = function() {foundspeaker();};
        req.open("GET", '/lookupspeaker?handle=' + handle, true);
        req.send(null);
    document.note.speakertwitter.value = '@' + handle;
}
function makespeakerbutton(speaker) {
    var id = speaker.twitter.trim().replace(/\s/g,'_')
    if (id =="" ) {
        id = speaker.name.trim().replace(/\s/g,'_')
    }
    if (id && !document.getElementById(id)) {
        var button = document.createElement("input");
        button.type = "button";
        button.value = id;
        button.id = id;
        button.setAttribute('onclick', 'setspeaker(' + JSON.stringify(speaker) +');');
        document.getElementById('speakerlist').appendChild(button);
    }
}
function foundspeaker() {
   // only if req is "loaded"
   if (req.readyState == 4) {
       // only if "OK"
       if (req.status == 200 || req.status == 304) {
           //document.getElementById('error').innerHTML=req.responseText;
           speaker = JSON.parse(req.responseText);
           setspeaker(speaker);
           makespeakerbutton(speaker)
        } else {
           document.getElementById('error').innerHTML="ahah error:\n" +
               req.statusText;
       }
   }
}
function setspeaker(speaker) {
    document.note.speakertwitter.value = speaker.twitter;
    document.note.speakerurl.value = speaker.url ? speaker.url : "https://twitter.com/"+ speaker.twitter;
    document.note.speakername.value = speaker.name ? speaker.name : speaker.twitter ;
}
function savespeaker() {
    speaker= {};
    speaker.twitter = document.note.speakertwitter.value;
    speaker.url = document.note.speakerurl.value;
    speaker.name = document.note.speakername.value;
    makespeakerbutton(speaker)
    
}
function deletespeaker() {
    var id = document.note.speakertwitter.value.trim().replace(/\s/g,'_')
    if (id =="" ) {
        id = document.note.speakername.value.trim().replace(/\s/g,'_')
    }
    var speakerbutton = document.getElementById(id);
    
    if (speakerbutton) {
        speakerbutton.parentNode.removeChild(speakerbutton);
    }
    
}function loadprofiledata() {
    if (this.readyState === 4) {
        var data = JSON.parse(this.responseText);
        console.log(data);
        document.querySelector("#profileimage").src = data.profileImage;
        document.querySelector("#profilename").innerText = '@' +data.screenName;
        document.querySelector("#profileimage2").src = data.profileImage;
        document.querySelector("#profilename2").innerText = '@' +data.screenName;
        document.querySelector("#profilefullname").innerText = data.fullName;
        document.querySelector("#profile").classList.remove('hidden');
        // Hide login button
        document.querySelector("a[href='/auth/twitter']").classList.add('hidden');
        document.querySelector("a[href='/auth/twitterlogout']").classList.remove('hidden');
		recoverLocal( '@' + data.screenName );
    }
}

document.addEventListener("DOMContentLoaded", function() {
    var req = new XMLHttpRequest();
    req.open("GET", "/showuser", true);
    req.onreadystatechange = loadprofiledata;
    req.send();
});