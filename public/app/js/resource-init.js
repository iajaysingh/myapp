var myApp = (function() {
    /* App configuration */
    var configData = {
        resource: {
            url: "http://localhost:3000/demo/open_graph/index.html",
            image: "http://dummyimage.com/200X100/086080/ebfff8.png&text=OG",
            type: "og:link",
            title: "my demo app",
            description: "Demonstrate the tibbr resource api usage examples"
        },
        urls: {
            publish: "/actions/publish",
            unpublish: "/actions/id/unpublish",
            userPermissions: "/resources/user_permissions",
            userActions: "/resources/user_actions",
            comments: "/resources/comments",
            actionUser: "/actions/users",
            follow: "/resources/follow",
            unfollow: "/resources/unfollow",
            actionCount: "/actions/count",
            followerList: "/resources/followers"

        },
        /* Is current user liked resource? */
        liked: false,
        /* liked action id */
        likedActionId: null,
        /* IS current user following resource?  */
        following: false,
        /*  Has current user shared the resource? */
        shared: false,
        /* Has current user commented?  */
        commented: false,
        /* can  user follow  */
        canFollow: false
    },
    templates = {
        like: '<a class="js-like ${like}" rel="${like}">${like}</a><span class="js-like">|</span>',
        follow: '<span id = "follow-action" class="js-button-x" style="display: inline-block; margin-right: 25px;">' 
        + ' <div class="button">'
        + '      <a class="${action}-btn js-follow-link js-${action}" href="#">'
        + '         <span>${ title }</span>'
        + '         <i class="ui-inline-icon minus"></i>'
        + '     </a>'
        + ' </div>'
        + '</span>',
        share: "<a href='#' id='share-btn' > Share </a>",
        user_image: '<a target="_blank" href="${url}" ><img src="${image_url}" title="${name}" class="bordered-large large"></a>',
        comment_list_item: '<li class="entry js-msg-${ id }" id="js-msg-${ id }">' 
        + ' <div class=" tib-post ">'
        + '     <a class="profile-hover profile-pic q-tip user js-publish" data-event_key="user.selected" data-event_data="" href="${ user_url }">'
        + '         <img src="${user_image}" class="bordered-large large">'
        + '     </a>'
        + '     <div class="info">'
        + '         <div class="bg-wrap">'
        + '             <h6> <a class="profile-hover profile-name user_url js-user-info" href="${ user_url }">${ user_name }</a></h6>'
        + '             <p class="msg tib-content">'
        + '                 <span>${ content }</span>'
        + '             </p>'
        + '         </div>'
        + '     </div>'
        + ' </div>'
        + '</li>',
        share_box: "",
        comment_box: "",
        user_profile: "",
        resource_view: '<div class="wrap">' 
        + '<div class="media-box">'
        + '	<a href="${url}" target = "_blank" class = "img lfloat"><img src="${ image }" alt=""></a>'
        + '	<div class="info">'
        + '		<h6>'
        + '			<a class="">${ title }</a>'
        + '		</h6>'
        + '		<p>'
        + '			${ description }'
        + '		</p>'
        + '	</div>'
        + '</div>'
        + '</div>',
        user_name: "<a target=_blank href=${url}> ${ name }</a>"
    };

    /* setup application */
    this.setup = function(TIB) {
        this.currentUser = TIB.currentUser;
        var that = this;
        this.loggedIn = false;
        this.tib = TIB;
        if (TIB.loggedIn) {
            this.init();
        } else {
            TIB.onLogin(function() {
                that.init();
            });
        }
    };

    this.init = function() {
        var that = this;
        if (this.TIB.loggedIn) {
            /*
                     * Get the permissions for currentUser.
                     * Used to render action buttons on UI follow/Unfollow, like/unlike.
                     * Render button only when user can do action given in response
                     *
                     **/
            this.TIB.api({
                url: configData.urls.userPermissions,
                params: {
                    resource: configData.resource,
                    client_id: that.TIB.client_id
                },
                method: "GET",
                onResponse: function(data, status) {
                    /* set follow/unfollow action*/
                    configData.userPermission = data;
                    if (configData.userPermission.indexOf("unfollow") != -1) {
                        configData.canFollow = true;
                        configData.following = true;
                    };
                    if (configData.userPermission.indexOf("follow") != -1) {
                        configData.canFollow = true;
                    };
                    that.renderFollow();
                }
            });

            /*
                     * Get performed actions by current user.
                     * This is useful to upblish actions like "og:like"
                     *
                     **/
            this.TIB.api({
                url: configData.urls.userActions,
                params: {
                    include_action_objects: "og:like",
                    resource: configData.resource,
                    client_id: that.TIB.client_id
                },
                method: "GET",
                onResponse: function(data, status) {
                    configData.userPerformedActoins = data.og_action_performed;
                    /* set user likedActionId*/
                    if (data.og_action_performed.indexOf("og:like") != -1) {
                        configData.liked = true;
                        jQuery.each(data.actions || [], function(index, item) {
                            if (item.name == "og:like") {
                                configData.likedActionId = item.action_objects.items[0] ? item.action_objects.items[0].id : null;
                            }
                        });

                    };
                    myApp.renderLike();
                }
            });
            /* render UI component*/
            $("#login-button").hide();
                    
            $(".welcome-greet").append($.tmpl(templates.user_name, {
                name: TIB.currentUser.display_name
            })).show();
            /*render resource view*/
            this.rederResourceView();
            /* show comment post */
            $("#posting-tab-wrap").show();
            /* render comments */
            this.getCommentList();
            /*render share box events and UI*/
            this.renderShare();
        };
    };
    /* Share the resource */
    this.share = function(msg, targetSubjects, callback) {
        var that = this;
        publishAction({
            msg: msg || "Sharing from demo app",
            targetSubjects: targetSubjects,
            action_type: "og:share"
        }, function(res, status) {
            if (!(res.errors || res.error)) {
                if (typeof(callback) == "function") {
                    callback(res);
                }
            } else {
                that.showErrorMessage(res);
            }
        });

    };
    /* Follow the resource */
    this.follow = function(callback) {
        var that = this;
        this.TIB.api({
            url: configData.urls.follow,
            method: "POST",
            params: {
                resource: configData.resource,
                client_id: this.TIB.client_id
            },
            onResponse: function(res, status) {
                if (!(res.errors || res.error)) {
                    configData.following = true;
                    if (typeof(callback == 'function')) {
                        callback();
                    };
                } else {
                    that.showErrorMessage(res);
                }
            }
        });

    };
    /* unollow the resource */
    this.unfollow = function(callback) {
        var that = this;
        this.TIB.api({
            url: configData.urls.unfollow,
            method: "DELETE",
            params: {
                resource: configData.resource,
                client_id: this.TIB.client_id
            },
            onResponse: function(res, status) {
                if (!(res.errors || res.error) || status == 200) { /* unfollow successful */
                    configData.following = false;
                    if (typeof(callback == 'function')) {
                        callback();
                    };
                } else {
                    that.showErrorMessage(res);
                }
            }
        });
    };
    /* publish comment on resource*/
    this.comment = function(msg, targetSubjects, callback) {
        var that = this;
        publishAction({
            msg: msg || "Commenting from demo app",
            targetSubjects: targetSubjects,
            action_type: "og:comment"
        }, function(res, status) {
            if (!(res.errors || res.error)) { /* comment successful */
                if (typeof(callback) == "function") {
                    callback(res);
                }
            } else {
                that.showErrorMessage(res);
            }
        });

    };
    /* unlike resource*/
    this.unlike = function() {
        var that = this;
        /* unpunlish the like action  */
        this.unpublishAction(configData.likedActionId, function() {
            configData.liked = false;
            configData.likedActionId = null;
            that.renderLike();
        })
    };
    /* publish like action on resource*/
    this.like = function() {
        var that = this;
        publishAction({
            action_type: "og:like"
        }, function(res, status) {
            if (!(res.errors || res.error)) {
                configData.liked = true;
                configData.likedActionId = res.id;
                that.renderLike();
            } else {
                that.showErrorMessage(res);
            }
        });
    };
    /*common call for publishing the action*/
    this.publishAction = function(option, callback) {
        var data = {
            resource: configData.resource,
            action_type: option.action_type || "og:share"

        },
        /* get subject and append in msg with @ */
        subjects = option.targetSubjects ? $.map((option.targetSubjects).split(","), function(sujbect) {
            return "@" + sujbect;
        }).join(" ") + " " : "";

        if (option.msg) {
            data.message = {
                content: subjects + option.msg
            }
        };
        /* call publish API */
        this.TIB.api({
            url: configData.urls.publish,
            params: data,
            method: "POST",
            onResponse: function(res, status) {
                if (typeof callback == "function") {
                    callback(res, status);
                }
            }
        })
    };

    /* unpublish action , need action id*/
    this.unpublishAction = function(id, callback) {
        var data = {
            resource: configData.resource
        }
        /* call unpublish API */
        this.TIB.api({
            url: configData.urls.unpublish.replace("id", id),
            params: data,
            method: "DELETE",
            onResponse: function(res, status) {
                if (typeof callback == "function") {
                    callback(res, status);
                }
            }
        })
    };
    /*
             * Helpers functions
             * Show Error message using Jquery UI
             *
             */
    this.showMessage = function(msg, title) {
        title = title ? title : "Hey there!!"
        $("#dialog").html(msg).dialog({
            title: title,
            buttons: [{
                text: "OK",
                click: function() {
                    $(this).dialog("close");
                }
            }]
        });
    };
            
    /*
             * reformat the image URL of user object
             *
             */
    this.userImageUlr = function(user_image, size) {
        var urls = user_image.split(",");
        var url_index = urls.indexOf(size || "medium"); /*return tib_init.host+"/a"+urls[url_index+1] */
        return tib_init.host + urls[url_index + 1]
    }


    /* format and display API response error*/
    this.showErrorMessage = function(res) {
        this.showMessage(res.errors || res.error);
    }
    /* helpers ends*/
    /* render views functions */
    /* render resource view */
    this.rederResourceView = function() {
        $(".resource-detail").append($.tmpl(templates.resource_view, configData.resource)).show();
    };
    /* get comments and render the comment list view */
    this.getCommentList = function() {
        var that = this;
        $("#tibbit_list").html("");
        /* Call the resource comments API */
        this.TIB.api({
            url: configData.urls.comments,
            params: {
                resource: configData.resource,
                per_page: 30
            },
            method: "GET",
            onResponse: function(res, status) {
                $.each(res.items || [], function(index, item) {
                    that.renderComment(item);
                })
            }
        })

    };
    /* render follow button */
    this.renderFollow = function() {
        var that = this;
        if (configData.canFollow) {
            $("#follow-action").remove();
            $(".resource-action").append($.tmpl(templates.follow, {
                action: configData.following ? "unfollow" : "follow",
                title: configData.following ? "Unfollow" : "Follow"
            }));
            $(".resource-action .js-follow-link").click(function(e) {
                e.preventDefault();
                if ($(this).is(".js-follow")) {
                    that.follow(function() {
                        that.renderFollow()
                    })
                } else {
                    that.unfollow(function() {
                        that.renderFollow()
                    })
                }
            })
        }
    };
    /* render like button */
    this.renderLike = function() {
        var that = this;
        $(".resource-header .js-like").remove();
        $(".resource-header .action-links").prepend($.tmpl(templates.like, {
            like: configData.liked ? "unlike" : "like"
        }));
        $(".js-like").click(function(e) {
            e.preventDefault();
            if ($(this).is(".unlike")) {
                that.unlike();
            } else {
                that.like();
            }
        })
    };
    /* render Share, bind click handler of share link */
    this.renderShare = function() {
        $(".js-share").click(function() {
            $("#share-wrap").dialog({
                title: "Share Resource",
                width: 700,
                buttons: [{
                    text: "Share",
                    click: function() {
                        $("form", this).submit();
                    }
                }, {
                    text: "Cancel",
                    click: function() {
                        $(this).dialog("close");
                    }
                }]
            });
        });
    };

    /* render individual comment object
            *  prepend: if true then added at top of comment list. Used when comment posted from app
            *  */
    this.renderComment = function(comment, prepend) {
        var commentUI = $.tmpl(templates.comment_list_item, {
            content: comment.content,
            id: comment.id,
            user_name: comment.user.display_name,
            user_image: userImageUlr(comment.user.profile_image_url),
            user_url: "#"
        })
        prepend ? $("#tibbit_list").prepend(commentUI) : $("#tibbit_list").append(commentUI);
    };
    return this;
})();

