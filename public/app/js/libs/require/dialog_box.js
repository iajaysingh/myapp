define(["jquery", "require/jquery-ui"], function ($, $UI) {

    var translate = (I18n.translations[I18n.locale] || {}).dialog || {common: {}},
        IE7 = $.browser.msie && parseInt($.browser.version, 10) == 7,
        title = translate.title,
        $div = $('<div id="tibbr-ui-dialog" />'),
        icon = '<span style="float: left; margin-left: -18px;" />',
        cancelLabel = translate.common.cancel,
        saveLabel = translate.common.ok,
        setText = function (text, icon) {
            var $p = $('<p id="dialog-message" style=" margin-left: 10px;"/>');
            $p.append(setIcon(icon)).append(text);
            $div.html($p);
        },

        setIcon = function (type) {
            type = type || 'info';
            return $(icon).addClass("ui-icon ui-icon-" + type);
        },

        /**
         * render dialog using given html and option
         * @html  html
         * @options jQuery UI options
         * @view view if the html is part of view provide view
         */
            view = function (html, options, view) {
            options = options || {};
            var tibbrClass = 'tibbr-ui-dialog',
                dialogClass = (options.className || "") + " " + tibbrClass,
                width = options.width || "auto",
                height = options.height || "auto",
                resizable = options.resizable || false,
                modal = options.modal === undefined ? true : options.modal,
                position = options.position || "center",
                buttons = {},
                $viewDiv = $('<div class="tibbr-ui-dialog" />');
            $viewDiv.html($('<div class="ui-dialog-message" style=" margin-bottom: 10px;"/>').append(html))
                .dialog({
                    modal: modal,
                    title: options.title || "",
                    zIndex: 14000,
                    width: width,
                    height: height,
                    resizable: resizable,
                    buttons: buttons,
                    dialogClass: dialogClass,
                    open: function () {
                        if (options.title){
                            $(".ui-dialog").addClass(".tibbr-files-dialog")
                        }
                        if (IE7) { // fixing title width for IE7
                            var contentWidth = $(this).width();
                            $(this).parent().find('.ui-dialog-titlebar').each(function () {
                                $(this).width(contentWidth);
                            });
                        }

                        if (typeof options.open == "function") {
                            options.open();
                        }
                        if (view) {
                            //define close button for the dialog
                            view.dialog.close = function () {
                                $viewDiv.dialog('destroy').remove();
                            };

                            var $that = $(this);
                            _.delay(function () {
                                $that.dialog('option', 'position', position);
                            }, 200);

                        } else {
                            $(this).dialog('option', 'position', position);
                        }

                    },
                    close: function () {
                        if (IE7) {
                            $(this).parent().css("width", "auto");
                        }
                        if (typeof options.close == "function") {
                            options.close(view);
                        }
                        if (view) {
                            view.leave();
                            view = null;
                        }
                        $viewDiv.dialog('destroy').remove();
                        $viewDiv = null;
                    }});

            return $viewDiv;
        },

        /**
         * render jQuery UI Dialog using a backbone View
         * @View Backbone View
         * @options options
         *
         * exampl:
         * Dialog.render(MyView, {
             *   fetch: collection // fetch the collection after rending the dialog
             *   dialog: {} // jQuery UI dialog options
             *   data: {}, data used to fetch the colleciton
             *   renderFun: render function if it is different then render
             *   complete: callback on render complete action
             *   close: callback on   close action
             *
             * })
         */
            render = function (View, options) {
            options = options || {};
            var that = this,
                fetcher = options.fetch,
                data = options.data,
                dialogOption = options.dialog || {},
                complete = options.complete,
                renderFun = options.render || "render";

            dialogOption.close = dialogOption.close || options.close;
            delete options.fetch;
            delete options.dialog;
            delete options.data;
            delete options.complete;
            delete options.close;
            delete options.render;
            var view = new View(options);
            view.dialog = that;
            if (view.dialogTitle) {
                dialogOption.className = "with-title";
            }
            if (!fetcher || fetcher.fetched) {
                var $_dialog = that.view(view[renderFun]().el, dialogOption, view);
                if (typeof view.bind == "function") view.bind();
                if (typeof complete == "function") complete(view);
                if (view.dialogTitle) {
                    $_dialog.dialog("option", "title", view.dialogTitle);
                }
            } else {
                $_dialog = that.view("", dialogOption, view);
                fetcher.fetch({
                    data: (data || fetcher.dataParams || {}),
                    success: function () {
                        fetcher.fetched = true;
                        if (fetcher.hasOwnProperty("build")) {
                            fetcher.build();
                        }
                        $_dialog.find(".ui-dialog-message").html(view[renderFun]().el);
                        if (typeof view.bind == "function") {
                            view.bind();
                        }
                        if (typeof complete == "function") {
                            complete(view);
                        }
                        $div.trigger("dialogopen");
                        if (view.dialogTitle) {
                            $_dialog.dialog("option", "title", view.dialogTitle);
                        }
                    },
                    beforeSend: function () {
                        $_dialog.find(".ui-dialog-message").html(window.loader);
                    }})
            }

        },

        show = function (options) {
            var
                title = options.title || "",
                text = options.text || "",
                icon = options.type,
                ok_function = options.ok_function,
                dialogClass = options.dialogClass,
                width = options.width,
                position = options.position || [];
            setText(text, icon);
            var buttons = {};
            buttons[saveLabel] = function () {
                if (typeof ok_function == "function") {
                    ok_function();
                }
                close();
            };
            $div.dialog({
                modal: true,
                title: title,
                closeOnEscape: false,
                resizable: false,
                zIndex: 99999,
                position: position,
                buttons: buttons,
                open: function (jQEvent) {
                    var $parent = $(jQEvent.target).parent();
                    $parent.find('.ui-button-text').each(function (i) {
                        $(this).html($(this).parent().attr('text'))
                    });
                    $parent.find('a.ui-dialog-titlebar-close').hide();

                    if (dialogClass !== undefined) {
                        $div.dialog("option", "dialogClass", dialogClass);
                    }
                    if (width !== undefined) {
                        $div.dialog("option", "width", width);
                    }

                }

            });


        },

        confirm = function (options) {
            var okFunction = options.okFunction,
                cancelFunction = options.cancelFunction,
                _cancelLabel = options.cancelLabel || cancelLabel,
                _saveLabel = options.saveLabel || saveLabel,
                _title = options.title || title,
                text = options.text,
                width = options.width || 300;


            var buttons = {};
            buttons[_saveLabel] = function () {
                var $p = $('p#dialog_message');

                $('div.ui-dialog-buttonpane').hide();
                $p.html(spinner);
                if (typeof okFunction === "function") {
                    okFunction();
                }
                close();
            };
            buttons[_cancelLabel] = function () {
                if (typeof cancelFunction === "function") {
                    cancelFunction();
                }
                close();
            };


            setText(text, 'alert');

            $div.dialog({
                bgiframe: true,
                title: _title,
                resizable: false,
                closeOnEscape: false,
                zIndex: 99999,
                minHeight: 100,
                minWidth: width,
                modal: true,
                buttons: buttons,
                open: function (jQEvent) {
                    var $parent = $(jQEvent.target).parent();
                    //todo: next jquery update need to look it fix for jquery.ui bug with jquery 1.8
                    $parent.find('.ui-button-text').each(function (i) {
                        $(this).html($(this).parent().attr('text'))
                    });
                    $parent.find('a.ui-dialog-titlebar-close').hide();

                    if (dialogClass !== undefined) {
                        $div.dialog("option", "dialogClass", dialogClass);
                    }
                    if (width !== undefined) {
                        $div.dialog("option", "width", width);
                    }

                }
            });
        },
        close = function () {
            $div.dialog('destroy').remove();
        },
        fallback = {
            confirm: function (options) {
                var okFunction = options.okFunction,
                    cancelFunction = options.cancelFunction;
                if (window.confirm(options.text)) {
                    if (typeof okFunction == "function") {
                        okFunction();
                    }
                }
                else {
                    if (typeof cancelFunction == "function") {
                        cancelFunction();
                    }
                }
            }
        };


    if ($.ui && $.ui.dialog) {
        $.ui.dialog.overlay.events = $.map('focus,keydown,keypress'.split(','),function (event) {
            return event + '.dialog-overlay';
        }).join(' ');
    }


    return {

        isOpen: function () {
            return $("div#tibbr-ui-dialog").length > 0
        },
        /**
         * close opening jquery dialog
         * if closing form view need to passe view as params so that view can be clean
         */
        close: function () {
            $div.dialog("close");
        },

        /**
         * display alert dialog
         * @param options
         */
        alert: function (options) {
            if (this.isOpen()) {
                alert(options.text);
            } else {
                options.type = 'alert';
                show(options);
            }
        },

        message: function (options) {
            options.type = options.type || 'check';
            show(options);
        },
        view: view,
        render: render,
        remove: function (options) {
            options.saveLabel = translate.remove.ok;
            options.cancelLabel = translate.remove.cancel;
            this.confirm(options);
        },

        resize: function () {
        },

        confirm: function (options) {
            if (this.isOpen()) {
                fallback.confirm(options);
            } else {
                confirm(options);
            }

        }




    };
});