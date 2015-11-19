function showHoverCard(event) {
    event.currentTarget.stashHTML = event.currentTarget.innerHTML;
    event.currentTarget.innerHTML =  "<iframe class='u-hovercard' src='http://unmung.com/hovercard?url="+event.currentTarget.href+"' width=256 height=128 ></iframe>";
}
function hideHoverCard(event) {
    event.currentTarget.innerHTML = event.currentTarget.stashHTML;
}   
document.onreadystatechange = function () {
  if (document.readyState == "interactive") {
    var people = document.getElementsByClassName('h-card')
    for (var i=0;i <people.length;i++) {
        var person = people.item(i);
        if (person.href) {
            person.addEventListener("mouseenter", showHoverCard);
            person.addEventListener("mouseleave", hideHoverCard);
        }
    }
  }
}
