const images = ['assets/images/hero.png','assets/images/hero2.jpg', 'assets/images/hero3.jpg'];


//Animation setup
$(function() {
	//add scroll animations
	$('.card--plan').addClass('wow fadeIn');
	$('.card--testimonial').addClass('wow fadeInLeft');
	$('.gallery__item').each(function() {
		const rand_num = Math.round(10 * Math.random()) / 10;
		$(this).addClass('wow fadeIn').attr('data-wow-delay',`${rand_num}s`)
	});

	new WOW().init();


	const $nav_hero = $('.hero');
	let hero = new Hero({
        $hero: $nav_hero,
        autoAnimation: 'slideToLeft',
        autoDuration: 6000,
        slideDuration: 4000,
        images: images,
    });

});

//Smooth Scroll To Section ***********************************//
//Modified code from
// https://www.w3schools.com/jquery/tryit.asp?filename=tryjquery_eff_animate_smoothscroll
$('a').click(function(e) {
    //check if there exists a hash (id) to scroll to.
    if(this.hash !== "") {
        console.log('clicked');

        const hash = this.hash;
        const topOfHash = $(hash).offset().top;
        const heightRatio = topOfHash / $(document).height(); 

        console.log(hash);

        $('html, body').animate({

            scrollTop: topOfHash

        }, 2000 * heightRatio, function() {

            window.location.hash = hash;
        });

    }
});

//****************************************************//
//Hamburger Menu Functionality
$('#mainMenuBarIcon').click(() =>{
	$('#navBar').toggleClass('navBar--viewable');
})


//****************************************************//
//Modified details selector code from
//https://stackoverflow.com/questions/16751345/automatically-close-all-the-other-details-tags-after-opening-a-specific-detai
$('.detailsContainer details').click(function(e) {
	$('.detailsContainer details').not(this).removeAttr("open");

	if ($(this).attr("open") === true) {
		$(this).removeAttr("open");
	}
});


//****************************************************//
//Create zoomable image
const enlargeableAnimationDuration = 300;

$('.enlargeable_image__zoomTarget').click(function(e) {
	const image_src = $(this).closest('.enlargeable_image').find('img').attr('src');
	$('.gallery__blownImage').css('background-image', `url(${image_src})`);
	$('.gallery__blownImage').fadeIn(enlargeableAnimationDuration);

});

$('.gallery__blownImage').click(function(e) {
	$(this).fadeOut(enlargeableAnimationDuration);
});


//****************************************************//
//gallery filter
const filterDuration = 500;
const filterButtonClassName = 'gallery__filterButton';
const galleryItemName = 'gallery__item';
const filterNames = ['campus', 'student', 'photo'];
const filterAllName = 'all';

const $filterButtons = $('.' + filterButtonClassName);

$filterButtons.click(function(e) {
	//highlight the selected button.
	$filterButtons.not(this).removeClass(`${filterButtonClassName}--highlighted`);
	$(this).addClass(`${filterButtonClassName}--highlighted`);

	//if 'all' filter selected, show all images else filter for category
	if($(this).hasClass(`${filterButtonClassName}--${filterAllName}`)) {
		$(`.${galleryItemName}`).show(filterDuration);
	} else {
		//make only corresponding images in category to filter visible.
		for(const filterName of filterNames) {
			const $imagesOfFilterName = $(`.${galleryItemName}--${filterName}`);
			if ($(this).hasClass(`${filterButtonClassName}--${filterName}`)) {
				$imagesOfFilterName.show(filterDuration);
			} else {
				$imagesOfFilterName.hide(filterDuration);
			}
		}
	}
});


//HERO Animation Classes *****************************************//
class Hero {
    //accepts $hero, $prev_nav, $next_nav, slideDuration, autoDuration
    constructor(obj) {
        $.extend(this, obj);

        this.leftImageCSS = {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0, 
        };
        this.leftImageResetCSS = {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: '100%', 
        }
        this.rightImageCSS = {
            position: 'absolute',
            top: 0,
            left: '100%',
            bottom: 0,
            right: 0, 
        };

        this.imageIndexCounter = new LoopCounter(0, this.images.length - 1);

        //allow asynchronous operation of animations and chainability
        this.animationPromise = Promise.resolve();
        
        this.$leftImage = $('<div>').css(this.leftImageCSS);
        this.$rightImage = $('<div>').css(this.rightImageCSS);

        this.$hero.append(this.$leftImage, this.$rightImage);
        
        //ensure parent hero is positioned
        if (this.$hero.css('position') === 'static') {
            this.$hero.css('position', 'relative');
        }

        //Setup automated animation
        if (!("autoDuration" in this) || this.autoDuration === 0) {
            this.timedAnimateActive = false;
            this.autoDuration = 0;
        } else {
            this.timedAnimateActive = true;
            this.timedAnimate(this[this.autoAnimation || 'slideToLeft']);
        }
        
        //Setup clickable next and previous navigations
        if(("$next_nav" in this) && ("$prev_nav" in this)) {
            this.$next_nav.on('click', this.slideToLeft.bind(this));
            this.$prev_nav.on('click', this.slideToRight.bind(this));
        }

    }

    timedAnimate(animation) {
        setTimeout(() => {
            if (this.timedAnimateActive) {
                animation.call(this);
                this.timedAnimate(animation);
            }
        },this.autoDuration);
    }

    slideToLeft() {
        this.animationPromise = this.animationPromise.then(
        () => {
            return new Promise((resolve, reject) => {
                if (this.$leftImage.width() < this.$rightImage.width()) {
                    this.$leftImage.css(this.rightImageCSS);
                    this.swapLeftRightImageProperties();
                }

                this.imageIndexCounter.increment();
                this.$rightImage.css('background-image', `url('${this.images[this.imageIndexCounter.index]}')`);
                
                this.$leftImage.animate({right: '100%'}, {duration: this.slideDuration, queue: false});
                this.$rightImage.animate({left: '0%'}, {
                    duration: this.slideDuration, 
                    queue: false,
                    complete: () => {
                        //switch the two images and reuse the former leftImage as the new rightImage
                        const $tempImage = this.$leftImage;
                        this.$leftImage = this.$rightImage;
                        this.$rightImage = $tempImage;
                        this.$rightImage.css(this.rightImageCSS);

                        this.animationDone = true;
                        resolve();
                    }
                });
            
            });

        });

        return this;
    }

    slideToRight() {
        this.animationPromise = this.animationPromise.then(
        () => {
            return new Promise((resolve, reject) => {
                if (this.$leftImage.width() > this.$rightImage.width()) {
                    this.$rightImage.css(this.leftImageResetCSS);
                    this.swapLeftRightImageProperties();
                    
                    
                }

                this.imageIndexCounter.decrement();
                this.$leftImage.css('background-image', `url('${this.images[this.imageIndexCounter.index]}')`);
                
                this.$leftImage.animate({right: '0%'}, {duration: this.slideDuration, queue: false});
                this.$rightImage.animate({left: '100%'}, {
                    duration: this.slideDuration, 
                    queue: false,
                    complete: () => {
                        this.animationDone = true;
                        resolve(this);
                    }
                });
            
            });

        });

        return this;
    }

    swapLeftRightImageProperties() {
        const $tempImage = this.$rightImage;
        this.$rightImage = this.$leftImage;
        this.$leftImage = $tempImage;
    }
}


class LoopCounter {
    constructor(start, end) {
        this.start = start;
        this.end = end;

        this.index = start;
    }

    increment() {
        this.index++;
        if (this.index > this.end) {
            this.index = this.start;
        }
        return this.index;
    }

    decrement() {
        this.index--;
        if (this.index < this.start) {
            this.index = this.end;
        }

        return this.index;
    }
}