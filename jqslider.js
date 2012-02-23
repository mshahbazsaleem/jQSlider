(function ($) {
    $.fn.extend({
        jqslider: function (options) {
            var settings = $.extend({
                theme: 'default',
                minValue: 0,
                maxValue: 10,
                selStart: 0,
                selEnd: 10,
                smallChange: 1,
                animate: true,
                animationSpeed: 500,
                ticks: true,
                labels: true,
                rangeSelection: true,
                dragTitle: 'Drag',
                callback: null
            }, options);
            return this.each(function () {
                var sliderHeight = 4;
                var sliderWidth = 200;
                var trackerHeight = 20;
                var trackerWidth = 20;
                var mousecaptured = false;
                var mouseDown = false;
                var previousMousePosition = 0;
                var currentValue = settings.minValue;
                var sliderLeft = 0;
                var sliderRight = 0;
                var ltop = 0;
                var isLoaded = false;
                var element = $(this);
                var adjustmentFactor = 0;
                var minvallabel = $('<div/>').attr('id', 'min-val').css('float', 'left');
                var maxvallabel = $('<div/>').attr('id', 'max-val').css('float', 'left');
                var wrapper = $('<div/>').css('float', 'left');
                var contents = $('<div/>').addClass('jq-slider-wrapper');
                var slider = $('<div/>').addClass('jq-slider');
                var selection = $('<div/>').html('&nbsp').addClass('inner');
                var ltracker = $('<div/>').addClass('draghandle').css('left', '0').attr('title', settings.dragTitle);
                var rtracker = $('<div/>').addClass('draghandle').attr('title', settings.dragTitle);
                var toolTip = $('<div/>').addClass('tooltip');
                var currentHandle = 'left';
                var selectionStart = settings.minValue;
                var selectionEnd = settings.maxValue;

                var showToolTip = true;

                element.append(wrapper);
                wrapper.append(contents);
                contents.append(slider);
                slider.append(selection);
                contents.append(ltracker);

                if (settings.labels) {
                    element.prepend(minvallabel);
                    element.append(maxvallabel);
                }

                slider.addClass(settings.theme);
                selection.addClass(settings.theme);
                ltracker.addClass(settings.theme);
                contents.addClass(settings.theme);

                sliderWidth = slider.outerWidth();
                if (settings.rangeSelection) {
                    contents.append(rtracker);
                    rtracker.addClass(settings.theme);
                    rtracker.css('left', (sliderWidth - trackerWidth / 3) + 'px');
                }
                element.prepend(toolTip);
                var clear = $('<div></div>');
                clear.css('clear', 'both');
                element.append(clear);
                wrapper.css('width', sliderWidth + 'px');
                maxvallabel.html(settings.maxValue).css('padding-left', '6px');
                minvallabel.html(settings.minValue).css('padding-right', '4px');
                var labelMarginAdjustment = parseInt(maxvallabel.height() / 3);
                maxvallabel.css('margin-top', -labelMarginAdjustment + 'px');
                minvallabel.css('margin-top', -labelMarginAdjustment + 'px');
                var sliderBottom = sliderHeight;
                sliderLeft = slider.offset().left;
                sliderRight = sliderLeft + sliderWidth;
                ltop = (trackerHeight / 2) - sliderHeight / 2;
                previousMousePosition = sliderLeft;

                var totalTicks = settings.maxValue / settings.smallChange;
                totalTicks -= 1;
                var tickWidth = parseFloat(slider.width()) / (totalTicks);

                //tickWidth += tickWidth / totalTicks
                /*generates tick marks */
                var ticks = $("<ul></ul>");
                ticks.css('position', 'absolute');
                var height = slider.get(0).offsetHeight - 4;
                //var height = sliderHeight;
                var sliderBorder = slider.get(0).offsetHeight - sliderHeight;
                ltop -= sliderBorder / 2;
                ticks.css('top', height + 'px')
                ticks.attr('id', 'ticks');
                ticks.addClass('ticks');
                ticks.css('width', sliderWidth + 'px');
                ticks.css('margin-top', '0px');
                var tickLeft = 0;

                var tick = $('<li><span>|</span></li>');
                //tick.css('left', tickLeft + 'px');
                //ticks.append(tick);

                for (var count = 0; count <= totalTicks; count++) {

                    tick = $('<li><span>|</span><br/><span>' + settings.minValue * (count + 1) + '</span></li>');
                    tickLeft = count * tickWidth;
                    tick.css('left', tickLeft + 'px');

                    ticks.append(tick);
                }
                if (settings.ticks)
                    slider.after(ticks);

                ltracker.css('top', -ltop + 'px');
                rtracker.css('top', -ltop + 'px');

                ltracker.hover(function () {
                    $(this).addClass('selected');
                }, function () {
                    $(this).removeClass('selected');
                });
                rtracker.hover(function () {
                    $(this).addClass('selected');
                }, function () {
                    $(this).removeClass('selected');
                });
                adjustmentFactor = ltracker.offset().left;
                //var containerWidth = trackerWidth + minvallabel.width() + maxvallabel.width() + 50;
                //set the default position
                if (!settings.rangeSelection) {
                    if (settings.selStart != 0) {
                        showToolTip = false;
                        isLoaded = true;
                        setTrackerPosition(settings.selStart * tickWidth);
                    }
                }
                else {

                    if (settings.selStart != settings.minValue) {
                        showToolTip = false;
                        var newPosition = parseInt(settings.selStart * tickWidth) + (adjustmentFactor - tickWidth);
                        setTrackerPosition(newPosition);
                        isLoaded = true;
                    }
                    if (settings.selEnd != settings.maxValue) {
                        showToolTip = false;
                        currentHandle = "right";
                        previousMousePosition = rtracker.offset().left;
                        var newPosition = parseInt(settings.selEnd * tickWidth) + (adjustmentFactor - tickWidth); // +trackerWidth / 2;
                        if (!isLoaded) isLoaded = true;
                        setTrackerPosition(newPosition);
                    }
                }

                if (!isLoaded) isLoaded = true;

                ltracker.mousedown(function (e) {
                    currentHandle = 'left';
                    showToolTip = false;
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    mousecaptured = true;
                    previousMousePosition = e.pageX;
                    $(this).css('cursor', 'pointer');
                    $(this).addClass('selected');
                });

                ltracker.mouseup(function (e) {
                    mousecaptured = false;
                    $(this).css('cursor', 'default');
                    $(this).removeClass('selected');

                });

                rtracker.mousedown(function (e) {
                    showToolTip = false;
                    currentHandle = 'right';
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    mousecaptured = true;
                    previousMousePosition = e.pageX;
                    $(this).css('cursor', 'pointer');
                    $(this).addClass('selected');

                });

                rtracker.mouseup(function (e) {
                    mousecaptured = false;
                    $(this).css('cursor', 'default');
                    $(this).removeClass('selected');
                });

                $(document).mouseup(function () {
                    mousecaptured = false;
                    $(this).css('cursor', 'default');
                    ltracker.removeClass('selected');
                    rtracker.removeClass('selected');
                    toolTip.css('display', 'none');
                });
                $(document).mousemove(function (e) {
                    if (mousecaptured) {
                        setTrackerPosition(e.pageX);
                        e.stopPropagation();
                        e.preventDefault();
                        e.stopImmediatePropagation();
                    }
                });
                slider.mouseenter(function (e) { $(this).css('cursor', 'pointer'); });
                slider.mouseout(function (e) { $(this).css('cursor', 'default'); });
                slider.mousedown(function (e) {
                    if (!settings.rangeSelection) {
                        if (!mouseDown) {
                            mouseDown = true;
                            $(this).css('cursor', 'pointer');
                            mousecaptured = false;
                            setTrackerPosition(e.pageX);
                        }
                    }
                    else {
                        if (!mouseDown) {
                            mouseDown = true;
                            $(this).css('cursor', 'pointer');
                            mousecaptured = false;
                            //determine which handle to move
                            var leftHandlePosition = ltracker.position().left + trackerWidth + adjustmentFactor;
                            var rightHandlePosition = rtracker.offset().left;
                            var adjustment = (rightHandlePosition - rtracker.position().left);
                            // leftHandlePosition = leftHandlePosition + adjustment;
                            var midPoint = rightHandlePosition - leftHandlePosition;

                            midPoint /= 2;

                            currentHandle = 'left';
                            previousMousePosition = leftHandlePosition;
                            if (e.pageX > leftHandlePosition + midPoint) {
                                previousMousePosition = rightHandlePosition;
                                currentHandle = 'right';
                            }
                            setTrackerPosition(e.pageX);
                            mouseDown = false;
                        }
                    }
                });

                function getpositionvalue(pos) {
                    var val = parseInt(pos.replace('px', ''));
                    return val;
                }
                function getDragAmount(cursorCurrentPosition, cursorPreviousPosition) {
                    var dragAmount = cursorCurrentPosition - cursorPreviousPosition;
                    if (cursorPreviousPosition <= 0) {
                        dragAmount = cursorCurrentPosition - sliderLeft;
                        previousMousePosition = sliderLeft + dragAmount;
                    }
                    if (cursorPreviousPosition > cursorCurrentPosition)
                        dragAmount = cursorPreviousPosition - cursorCurrentPosition;

                    return dragAmount;
                }
                function isForwardDirection(cursorCurrentPosition, cursorPreviousPosition) {
                    return (cursorCurrentPosition > cursorPreviousPosition)
                }
                function validatePosition(position) {
                    return (position >= 0 && position <= sliderWidth)
                }
                function setPosition(position, elHandle) {

                    if (validatePosition(position)) {
                        if (settings.animate && !mousecaptured) {
                            elHandle.animate({ 'left': position + 'px' }, settings.animationSpeed, function () {
                                setElements(elHandle, position);
                            });
                        }
                        else {
                            setElements(elHandle, position);
                        }
                    }
                }
                function setElements(elHandle, position) {

                    elHandle.css('left', position + 'px');
                    if (!settings.rangeSelection) {
                        var selectionWidth = getpositionvalue(elHandle.css('left')) + trackerWidth / 2;
                        selection.css('width', selectionWidth + 'px');
                    }
                    else {
                        var selectionStart = getpositionvalue(ltracker.css('left'));
                        var selectionEnd = getpositionvalue(rtracker.css('left'));
                        var selectionWidth = selectionEnd - selectionStart;
                        selection.css('width', selectionWidth).css('left', selectionStart);
                    }
                    mouseDown = false;

                }
                function setTrackerPosition(cursorPosition) {

                    var elHandle = currentHandle == 'left' ? ltracker : rtracker;

                    var dragAmount = getDragAmount(cursorPosition, previousMousePosition);

                    var isForward = isForwardDirection(cursorPosition, previousMousePosition);

                    var trackerPosition = getpositionvalue(elHandle.css('left'));

                    var leftHandlePosition = ltracker.offset().left; // -trackerWidth; // -adjustmentFactor;
                    var rightHandlePosition = rtracker.offset().left;

                    if (cursorPosition >= sliderLeft && cursorPosition <= (sliderRight + 10)) {
                        if (trackerPosition >= 0 && trackerPosition <= sliderWidth + 4) {
                            var dalta = rightHandlePosition - leftHandlePosition;

                            if (settings.rangeSelection && dalta <= 0) {
                                if (currentHandle == 'left' && isForward)
                                    dragAmount = 0;
                                if (currentHandle == 'right' && !isForward)
                                    dragAmount = 0;
                            }

                            if (isForward)
                                trackerPosition += dragAmount;
                            else
                                trackerPosition -= dragAmount;

                            if (trackerPosition < 0) trackerPosition = 0;

                            setPosition(trackerPosition, elHandle);

                            var newPosition = cursorPosition - sliderLeft;
                            //original var cVal = newPosition  / tickWidth; replce the line below if it doesn't work
                            var cVal = newPosition / tickWidth; // (newPosition - trackerWidth / 3) / (tickWidth - 1);

                            currentValue = (dragAmount > 0 ? cVal : 0) + settings.minValue;

                            if (settings.smallChange.toString().lastIndexOf('.') > -1) {
                                if (trackerPosition > (sliderWidth - tickWidth) + tickWidth / 10) {
                                    currentValue = parseInt(sliderWidth / tickWidth);
                                }
                            }
                            var stepFactor = settings.smallChange;
                            var val = currentValue * stepFactor;
                            val = new Number(val + '').toFixed(parseInt(1));
                            val = parseInt(val);
                            var handle = null;

                            if (val <= 0)
                                val = settings.minValue;

                            if (val > settings.maxValue)
                                val = settings.maxValue;

                            if (currentHandle == 'left') {
                                selectionStart = val;
                                handle = ltracker;
                            }
                            else {
                                handle = rtracker;
                                selectionEnd = val;
                            }
                            if (handle != null) {
                                toolTip.css('top', handle.offset().top - handle.height());
                                toolTip.css('left', handle.offset().left);
                            }
                            if (showToolTip) toolTip.css('display', '');
                            else toolTip.css('display', 'none');
                            if (dragAmount > 0)
                                toolTip.html(val);
                            if (settings.callback != null && isLoaded) {

                                if (settings.rangeSelection)
                                    settings.callback(selectionStart, selectionEnd);
                                else
                                    settings.callback(val);
                            }
                        }
                        previousMousePosition = cursorPosition;
                        showToolTip = true;
                    }
                }
                return this;
            });
        }
    });
})(jQuery);