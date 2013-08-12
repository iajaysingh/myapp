define(
    [
          'order!underscore'
        , 'order!e_note'
//        , 'order!require/moment'
    ],
    function (_, ENote) {

        var TimeZone = function () {
            this.date = new Date();
            this.timeZones = ENote.i18n.t("webui.time_zones");
        };
        _.extend(TimeZone.prototype, {
            format:"[GMT\\]Z",
            /**
             * find the zone from the zone id
             * @param zone_id
             * @return {*|Object}
             */
            zone:function (val) {
                return _.detect(this.timeZones, function (zone) {
                    return zone.id === val
                }) || {};
            },
            /**
             *  return true if currentUser in the current time zone
             * @return {Boolean}
             */
            inZone:function (val) {
                return this.zone(val).value.match(this._zone());
            },

            _zone:function () {
                return this.isDst() ? this.dst() : moment().format(this.format);
            },

            /**
             * get all the aviable zones base on time_zone offset
             * @return {Array of aviabile zone}
             */
            localZone:function () {
                var that = this;
                var locals = _.collect(this.timeZones, function (zone) {
                    if (zone.value.match(that._zone())) return zone;
                });
                locals = _.compact(locals);
                return locals;
            },


            stdTimezoneOffset:function () {
                var jan = new Date(this.date.getFullYear(), 0, 1);
                var july = new Date(this.date.getFullYear(), 6, 1);
                return Math.max(jan.getTimezoneOffset(), july.getTimezoneOffset());
            },
            isDst:function () {
                return this.date.getTimezoneOffset() < this.stdTimezoneOffset();
            },
            dst:function () {
                return moment(new Date(this.date.getFullYear(), 0, 1)).format(this.format)
            }

        });
        return TimeZone;

    });