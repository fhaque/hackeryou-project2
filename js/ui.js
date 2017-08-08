$('#mainMenuBarIcon').click(() =>{
	$('#navBar').toggleClass('navBar--viewable');
})

//Modified details selector code from
//https://stackoverflow.com/questions/16751345/automatically-close-all-the-other-details-tags-after-opening-a-specific-detai
$('.detailsContainer details').click(function(e) {
	$('.detailsContainer details').not(this).removeAttr("open");

	if ($(this).attr("open") === true) {
		$(this).removeAttr("open");
	}
});