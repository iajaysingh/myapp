define(['order!jquery'
    , 'order!underscore'
    , 'order!backbone'
    //, 'order!require/i18n-js'
    //, 'order!require/moment'
    , 'order!require/dialog'
    ],
    function($, _, Backbone, Dialog){
        var ENote = ENote || {};
    
        //Extending Backbone - Namespace Creation
        ENote.Model = Backbone.Model.extend({});
        ENote.Collection = Backbone.Collection.extend({});
        ENote.Router = Backbone.Router.extend({});

        ENote.View = Backbone.View.extend({});

        //Error Handling
        ENote.parseError = function (data) {
            if (data === undefined) return "";
            if (data.responseText) {
                data = $.parseJSON(data.responseText)
            }
            var errors = (data.errors || {}).error;
            return !_.isArray(errors) ? [errors] : errors;
        };
    
        //Stores the current user - Implementation Pending
        ENote.current_user = function(data){
        //OAuth
        };
    
        ENote.cookie = function (key, options) {
            options = options || {};
            var path = options.path || "/", expires = options.expires, cookies = {};

            options = {
                path:path, 
                expires:expires
            };

            function getCookie() {
                var _cookie = $.cookie(key) || "{}";
                cookies = JSON.parse(_cookie);
            }

            function setCookie() {
                var _cookie = JSON.stringify(cookies);
                $.cookie(key, _cookie, options)
            }

            return{
                get:function (key) {
                    getCookie();
                    return cookies[key];
                },

                set:function (key, value) {
                    cookies[key] = value;
                    setCookie()
                },
                empty:function () {
                    cookies = {};
                    $.cookie(key, "", options);
                }
            }
        };
   
        ENote.events = {}
        _.extend(ENote.events, Backbone.Events, {
            cid: "enote_events"
        });
    
//        ENote.i18n = I18n
//
////        ENote.dateFormat = I18n.t("webui.defaults.date.longDateFormat");
//
//        ENote.translate = I18n.translate;
        //configuration
        ENote.configs = {
            tibbr_url:  enote_init["tibbr_url"]
        };
        ENote.file_icons = {
            "application/pdf"               : "images/file-icons/pdf-icon.png",
            "application/msword"            : "images/file-icons/doc-icon.png",
            "image/png"                     : "images/file-icons/image-icon.png",
            "image/jpeg"                    : "images/file-icons/image-icon.png",
            "image/jpg"                     : "images/file-icons/image-icon.png",
            "image/gif"                     : "images/file-icons/image-icon.png",
            "application/vnd.ms-excel"      : "images/file-icons/xls-icon.png",
            "text/plain"                    : "images/file-icons/file_icon_txt.png",
            "application/vnd.ms-powerpoint" : "images/file-icons/ppt-icon.png",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"   : "images/file-icons/doc-icon.png",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation" : "images/file-icons/ppt-icon.png",
            "default-format"                : "images/file-icons/file-icon.png"
        };
        ENote.simplePlaceHolder = function(){
            if($.browser.hasOwnProperty("msie")){
                $('[placeholder]').focus(function() {
                    var input = $(this);
                    if (input.val() == input.attr('placeholder')) {
                        input.val('');
                        input.removeClass('placeholder');
                    }
                }).blur(function() {
                    var input = $(this);
                    if (input.val() == '' || input.val() == input.attr('placeholder')) {
                        input.addClass('placeholder');
                        input.val(input.attr('placeholder'));
                    }
                }).blur().parents('form').submit(function() {
                    $(this).find('[placeholder]').each(function() {
                        var input = $(this);
                        if (input.val() == input.attr('placeholder')) {
                            input.val('');
                        }
                    })
                });
            }
        }
//        ENote.Moment = Moment;
        ENote.Dialog = Dialog;
        window.ENote = ENote;
        return ENote;
    });