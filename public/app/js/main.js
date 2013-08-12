if (!window.console) {
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
    "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];
    
    window.console = {};
    for (var i = 0; i < names.length; ++i)
        window.console[names[i]] = function () {
        }
}

require.config({
    paths: {
        jquery: 'libs/jquery/jquery-min',
        underscore: 'libs/underscore/underscore',
        backbone: 'libs/backbone/backbone',
        text: 'libs/require/text',
        e_note: 'libs/e_note/e_note',
        templates: '../templates',
        require: 'libs/require'
    }
});
require([
    "order!jquery",
    'order!require/jquery-ui',
    'order!require/jquery.qtip',
    "order!underscore",
    'order!backbone',
    'order!e_note',
    'order!require/time_zone',
    'order!app'
    ], function($, $UI, Qtip, _, Backbone, ENote, TimeZone, App){
        //setting X-CSFR-TOKEN
        ENote._CSRF_TOKEN = $("meta[name='csrf-token']").attr("content");
        $(document).ajaxSend(function (e, xhr, options) {
            xhr.setRequestHeader("X-CSRF-Token", ENote._CSRF_TOKEN);
        });

        $.each(["append","prepend","html","hide","remove","show", "addClass", "removeClass"], function(i,v){
            var ext_f = $.fn[v];
            $.fn[v] = function(){
                if(window["dom_changed"])
                {
                    clearTimeout(window["dom_changed"]);
                    window["dom_changed"] = null;
                }
                window["dom_changed"] = setTimeout(function(){
                    if ($(".tibbr-files").length > 0){
                        TIBR.parentApp.setFrameHeight($("#content-wrap").height());
                    }
                }, "400")

                return ext_f.apply( this, arguments );
            };
        });
        ENote.time_zone = TimeZone;
        App.initialize();

        ENote.closeDialog = function(){
            $(".ui-dialog-content").dialog().dialog('destroy').remove();
        };

        //Placeholder support for IE
        ENote.simplePlaceHolder = function () {
            if ($.browser.hasOwnProperty("msie")) {
                $('[placeholder]').focus(function () {
                    var input = $(this);
                    if (input.val() == input.attr('placeholder')) {
                        input.val('');
                        input.removeClass('placeholder');
                    }
                }).blur(function () {
                        var input = $(this);
                        if (input.val() == '' || input.val() == input.attr('placeholder')) {
                            input.addClass('placeholder');
                            input.val(input.attr('placeholder'));
                        }
                    }).blur().parents('form').submit(function () {
                        $(this).find('[placeholder]').each(function () {
                            var input = $(this);
                            if (input.val() == input.attr('placeholder')) {
                                input.val('');
                            }
                        })
                    });
            }
        }
        ENote.simplePlaceHolder();
});

