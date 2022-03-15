'use strict'
$(document).ready(function () {

    /* page load as iframe */
    if (self !== top) {
        $('body').addClass('iframe');
    } else {
        $('body').removeClass('iframe');
    }

    /* Dropdown toggle */
    //$('.dropdown-toggle').dropdown()

    /* floating input text fields */
    $('.floating-input').each(function () {
        if (!$(this).val() || $(this).val().length === 0) {
            //$(this).parent().removeClass('active')
        } else {
            $(this).parent().addClass('active')
        }
    })
    $('.floating-input').on('blur', function () {
        if (!$(this).val() || $(this).val().length === 0) {
            $(this).parent().removeClass('active')
        } else {
            $(this).parent().addClass('active')
        }
    })

    /* filter open close */
    $('.filter-btn').on('click', function (e) {
        e.stopPropagation();
        $('.filter').toggleClass('active');
        $('.filter-backdrop').fadeToggle();
    })
    $('body').on("click", ":not(.filter, .filter *)", function (e) {
        if ($('.filter').hasClass('active') === true) {
            $('.filter').removeClass('active');
            $('.filter-backdrop').fadeOut();
        }
    });

    /* menu open close */
    $('.main-menu .close').on('click', function () {
        if ($('body').hasClass('menu-overlay') === true) {
            $('.main-menu').fadeOut();
            $('body').removeClass('menu-open');
        } else {
            $('body').removeClass('menu-active');
            $('body').removeClass('menu-open');
            $('html').removeClass('menu-open');
        }

    })
    $('.menu-btn').on('click', function () {
        if ($('body').hasClass('menu-overlay') === true) {
            $('.main-menu').fadeIn();
            $('body').addClass('menu-open');
        } else {
            $('body').addClass('menu-active');
            $('body').addClass('menu-open');
            $('html').addClass('menu-open');
        }
    })

    /* menu style switch */
    $('#menu-pushcontent').on('change', function () {
        if ($(this).is(':checked') === true) {
            $('body').addClass('menu-push-content');
            $('.main-menu').css('display', 'block');
            $('body').removeClass('menu-overlay');
        }
    });
    $('#menu-overlay').on('change', function () {
        if ($(this).is(':checked') === true) {
            $('body').removeClass('menu-push-content');
            $('.main-menu').css('display', 'none');
            $('body').addClass('menu-overlay');
        }
    });



});


$(window).on('load', function () {
    setTimeout(function () {
        $('.loader-display').fadeOut('slow');
    }, 500);


    /* Background */
    $('.background').each(function () {
        var imgpath = $(this).find('img');
        $(this).css('background-image', 'url(' + imgpath.attr('src') + ')');
        imgpath.hide();
    })

    /* url path on menu */
    var path = window.location.href; // because the 'href' property of the DOM element is the absolute path
    $(' .main-menu ul a').each(function () {
        if (this.href === path) {
            $(' .main-menu ul a').removeClass('active');
            $(this).addClass('active');
        }
    });


});

$(window).on('scroll', function () {

    if ($(document).scrollTop() > '40') {
        $('.header').addClass('active');
    } else {
        $('.header').removeClass('active');
    }
});


$(window).on('resize', function () {

});


