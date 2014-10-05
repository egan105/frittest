function toggle(id) {
	var e = document.getElementById(id);
	if(e.style.display == 'block') {
		e.style.display = 'none';
	}
	else {
		e.style.display = 'block';
	}
}

$(document).ready(function(){
	$('.unfollow').hover(function(){
		$(this).removeClass("btn-success");
		$(this).addClass("btn-danger");
    	$(this).text("Unfollow");
    }, function() {
    	$(this).removeClass("btn-danger");
		$(this).addClass("btn-success");
    	$(this).text("Following");
    });

    $('.fixedSize').width(
	    Math.max.apply(
	        Math,
	        $('.myButton').map(function(){
	            return $(this).outerWidth();
	        }).get()
	    )
	);
});
		      