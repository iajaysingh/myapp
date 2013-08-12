define(["order!jquery", "order!require/jquery-ui"], function ($, $UI) {
    return (function (app, global) {
            var div = '<div id="tibbr_dialog" />',
            icon = '<span style="float: left; margin-left: -18px;" />',
            cancelLabel = "Cancel", //translate.common.cancel,
            saveLabel = "Ok", //translate.common.ok,
            setText = function (text, icon) {
                $(".ui-dialog, #tibbr_dialog, #dialog_message").remove();
                var $p = $('<p id="dialog_message" style=" margin-left: 10px;"/>');
                $p.append(setIcon(icon)).append(text);
                div = $(div).append($p)[0];
            },

            setIcon = function (type) {
                var type = type || 'info';
                return $(icon).addClass("ui-icon ui-icon-" + type);
            },
            show = function (options) {
                var _title = options['title'] || title,
                    text = options['text'] || "",
                    icon = options['type'],
                    ok_function = options['ok_function'],
                    dialogClass = options['dialogClass'],
                    width = options['width'],
                    position = options['position'] || [];
                setText(text, icon);
                var buttons = {};
                buttons[saveLabel] = function () {
                            $(this).dialog("close");
                            $(".spinner").remove();
                            if (typeof ok_function == "function") {
                                ok_function();
                            }
                        };
                $(div).dialog({
                    modal:true,
                    title: "",
                    closeOnEscape:false,
                    resizable:false,
                    zIndex:99999,
                    buttons: buttons,
                    position: position
                });
                if (dialogClass !== undefined) {
                    $(div).dialog("option", "dialogClass", dialogClass);
                }
                if (width !== undefined) {
                    $(div).dialog("option", "width", width);
                }
                $('a.ui-dialog-titlebar-close').hide();

            }


        return {

            close:function () {
                $(div).dialog('close');
            },


            alert:function (options) {
                options['type'] = 'alert';
                show(options);
            },

            message:function (options) {
                options['type'] = options['type'] || 'check';
                show(options);
            },

            remove:function (options) {
                options.saveLabel = translate.remove.ok;
                options.cancelLabel = translate.remove.cancel;
                this.confirm(options);
            },

            confirm:function (options) {
                var okFunction = options['okFunction'],
                    cancelFunction = options['cancelFunction'],
                    _cancelLabel = options['cancelLabel'] || cancelLabel,
                    _saveLabel = options['saveLabel'] || saveLabel,
                    _title = options['title'] || title,
                    text = options['text'],
                    width = options['width'] || 300, position = options['position'] || [],
                    self = this;

                var buttons = {};
                buttons[_saveLabel] = function () {
                    var $p = $('p#dialog_message');
                    $('a.ui-dialog-titlebar-close').hide();
                    $('div.ui-dialog-buttonpane').hide();
                    $(this).dialog("close");
                    if (typeof okFunction == "function") {
                        if (typeof ok_function == "function") {
                            ok_function();
                        }
                    }
                };
                setText(text, 'alert');
                $(div).dialog({
                    bgiframe:true,
                    title: _title,
                    resizable:false,
                    closeOnEscape:false,
                    zIndex:99999,
                    minHeight:100,
                    minWidth:width,
                    modal:true,
                    overlay:{
                        backgroundColor:'#000',
                        opacity:0.5
                    },
                    buttons:buttons,
                    position : position
                });
                $('a.ui-dialog-titlebar-close').hide();
            }

        }


    }(window));
});