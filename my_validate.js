$.extend($.fn, {
    my_validate: function (options) {
        if (!this.length) {
            return ;
        }
        var validator = $.data(this[0], 'my_validator');
        if (validator) {
            return validator;
        }
        var validator = new my_validator(options, this);
        $.data(this[0], 'my_validator', validator);
        return validator;
    },
});
my_validator = function (options, form) {
    $.extend(this, {
        defaults: {
            errorClass: 'help-block error-block',
            errorElement: 'span',
            ignoreNames: [],
            ignoreSelectors: [],
            ignoreFn: function (el) { return false; },
            rules: {},
            messages: {
                required: "This field is required.",
                positive: "Please enter a positive number.",
                remote: "Please fix this field.",
                email: "Please enter a valid email address.",
                url: "Please enter a valid URL.",
                date: "Please enter a valid date.",
                dateISO: "Please enter a valid date ( ISO ).",
                number: "Please enter a valid number.",
                digits: "Please enter only digits.",
                creditcard: "Please enter a valid credit card number.",
                equalTo: "Please enter the same value again.",
                maxlength: "Please enter no more than {0} characters.",
                minlength: "Please enter at least {0} characters.",
                rangelength: "Please enter a value between {0} and {1} characters long.",
                range: "Please enter a value between {0} and {1}.",
                max: "Please enter a value less than or equal to {0}.",
                min: "Please enter a value greater than or equal to {0}.",
            },
            checkers: {
                required: function (el) {
                    var name = el.name;
                    var that = this;
                    var isRadio = $.isArray(that.fields[name]);
                    var _rule = that.rules[name];
                    // 如果是 radio box
                    if (isRadio) {
                        var radioList = that.fields[name];
                        var notEmpty = 0;
                        $.map(radioList, function (val, i) { notEmpty += $(val).is(":checked") ? 1:0 });
                        if (!notEmpty) {
                            return false;
                        }
                        return true;
                    } else {
                        if (el.type =='checkbox') {
                            return $(el).is(":checked");
                        }
                        var val = $(el).val();
                        if (val != null && typeof val === 'string') { // 若el是多选的 select 元素时，val 为数组
                            val = val.trim();
                        }
                        if (!val || parseFloat(val) == 0) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                },
                positive: function (el) {
                    var num = $(el).val();
                    return parseFloat(num) > 0;
                },
            },
            errorPlacement: function ($el, error) {
                $el.after(error);
            },
            highlight: function ($el) {
                $el.parents(".form-group").last().addClass("has-error");
            },
            unhighlight: function ($el) {
                $el.parents(".form-group").last().removeClass("has-error");
            },
        },
        rules: {},
        fields: {},
        errorList: {},
        errorCount: 0,
        errorTypes: {
            required: 'required',
        },
        _highlight: function (el) {
            /*
             * 此函数将会按照优先级使用最高优先级的高亮函数。
             * 查找顺序如下：特定元素>组元素>默认函数
             */
            // >--- 高亮错误信息
            var _rule = this.rules[el.name];
            var isGroup = !!_rule.errorGroup;
            var errorName = isGroup ? _rule.errorGroup : el.name;
            var highlightFn = this.settings.highlight; // 默认使用全局高亮函数
            // 用小组高亮函数覆盖默认
            if (isGroup && $.isFunction(this.settings.errorGroup[errorName].highlight)) {
                highlightFn = this.settings.errorGroup[errorName].highlight;
            }
            // 用元素高亮函数覆盖之前的函数
            if ($.isFunction(_rule.highlight)) {
                highlightFn = _rule.highlight;
            }
            highlightFn($(el));
            // <--- 高亮错误信息
        },
        _runTopLevelFn: function (fnName, el, args) {
            /*
             * 此函数将会按照优先级使用最高优先级的高亮函数。
             * 查找顺序如下：特定元素>组元素>默认函数
             */
            // >--- 高亮错误信息
            var _rule = this.rules[el.name];
            var isGroup = !!_rule.errorGroup;
            var errorName = isGroup ? _rule.errorGroup : el.name;
            var fn = this.settings[fnName]; // 默认使用全局高亮函数
            // 用小组高亮函数覆盖默认
            if (isGroup && $.isFunction(this.settings.errorGroup[errorName][fnName])) {
                fn = this.settings.errorGroup[errorName][fnName];
            }
            // 用元素高亮函数覆盖之前的函数
            if ($.isFunction(_rule[fnName])) {
                fn = _rule[fnName];
            }
            return fn.apply(this, args);
            // <--- 高亮错误信息
        },
        setError: function (el, errType) {
            errType = errType ? errType : 'required';
            var _rule = this.rules[el.name];
            var isGroup = !!_rule.errorGroup;
            var errorName = isGroup ? _rule.errorGroup : el.name;

            // 准备error元素，用来显示错误信息
            var error = null;
            if (this.errorList[errorName]) {
                error = this.errorList[errorName].error;
            } else {
                error = $("<" + this.settings.errorElement + ">");
                error.addClass(this.settings.errorClass);
                this.errorCount += 1;
            }
            var msg = this.rules[el.name].messages[errType];
            error.html(msg);

            // 将此错误加入错误列表，方便其他函数统计
            this.errorList[errorName] = {'element': el, 'errType': errType, 'error': error};

            // >--- 高亮错误信息
            this._highlight(el);
            /*
            var highlightFn = this.settings.highlight; // 默认使用全局高亮函数
            // 用小组高亮函数覆盖默认
            if (isGroup && $.isFunction(this.settings.errorGroup[errorName].highlight)) {
                highlightFn = this.settings.errorGroup[errorName].highlight;
            }
            // 用元素高亮函数覆盖之前的函数
            if ($.isFunction(_rule.highlight)) {
                highlightFn = _rule.highlight;
            }
            highlightFn($(el));
            */
            // <--- 高亮错误信息

            this._runTopLevelFn('errorPlacement', el, [$(el), error]);
        },
        _unhighlight: function (el) {
            /*
             * 此函数将会按照优先级使用最高优先级的高亮函数。
             * 查找顺序如下：特定元素>组元素>默认函数
             */
            // >--- 取消高亮错误信息
            var _rule = this.rules[el.name];
            var isGroup = !!_rule.errorGroup;
            var errorName = isGroup ? _rule.errorGroup : el.name;
            var unhighlightFn = this.settings.unhighlight; // 默认使用全局高亮函数
            // 用小组高亮函数覆盖默认
            if (isGroup && $.isFunction(this.settings.errorGroup[errorName].unhighlight)) {
                unhighlightFn = this.settings.errorGroup[errorName].unhighlight;
            }
            // 用元素高亮函数覆盖之前的函数
            if ($.isFunction(_rule.unhighlight)) {
                unhighlightFn = _rule.unhighlight;
            }
            unhighlightFn($(el));
            // <--- 取消高亮错误信息
        },
        clearError: function (el) {
            var _rule = this.rules[el.name];
            var isGroup = !!_rule.errorGroup;
            var errorName = isGroup ? _rule.errorGroup : el.name;
            var meta = this.errorList[errorName];
            // 如果该元素没有产生过错误，则直接退出
            if (!meta)
                return false;
            // 如果该元素所在组有过错误，且错误元素不是该元素，则退出
            if (meta.element != el)
                return false;

            this._unhighlight(el);
            meta.error.remove();

            delete this.errorList[errorName];
            this.errorCount -= 1;
        },
        checkAll: function () {
            // 先遍历所有错误，将子菜单中的错误消除，否则若父菜单先出错，会由于子菜单的消除动作导致父菜单的错误也被消除
            var checked = [];
            for (var name in this.errorList) {
                var meta = this.errorList[name];
                var el = meta.element;
                var _rule = this.rules[el.name];
                var result = this.check(el, _rule);
                if (!result[0]) {
                    this.setError(el, result[1]);
                } else {
                    this.clearError(el);
                }
                checked.push(el.name);
            }
            for (var name in this.fields) {
                var el = this.fields[name];
                var rule = this.rules[name];
                var result = [];
                if (checked.indexOf(name) != -1) {
                    // 已检查过的不再重复检查
                    continue;
                }
                if (name == 'budget[limit][on]') {
                    var a='1';
                }
                if ($.isArray(el)) {
                    /*
                    var els = el;
                    for (var i in els) {
                        var _el = els[i];
                        result = this.check(_el, rule);
                        //break;
                    }
                    */
                    el = el[0];
                    result = this.check(el, rule);
                } else {
                    if ($.isFunction(rule.ignore) && rule.ignore(el)) {
                        continue;
                    }
                    result = this.check(this.fields[name], rule);
                }
                if (!result[0]) {
                    console.log('check', el.name, result[0]);
                    this.setError(el, result[1]);
                } else {
                    this.clearError(el);
                }
            }
            return this.valid();
        },
        valid: function () {
            return !this.errorCount;
        },
        check: function (el, _rule) {
            var that = this;
            var _rule = $.extend(true, {}, this.default_rule, _rule);
            if (_rule.required) {
                // 如果定义了check函数，则不执行默认的check
                if (typeof _rule.check === 'function') {
                    var result = _rule.check(el);
                    if (result[0]) {
                        that.clearError(el);
                    } else {
                        that.setError(el, result[1]);
                    }
                    return _rule.result(el, !!result);
                }
                
                // >--- 默认 check 流程

                // 先检查依赖性
                if ($.isFunction(_rule.required)) {
                    if (!_rule.required.call(that)) {
                        return [true];
                    }
                }
                for (var checkerName in _rule.checkers) {
                    var checker = _rule.checkers[checkerName];
                    if (!checker.call(that, el)) {
                        return [false, checkerName];
                    }
                }

                // <--- 默认 check 流程
            }
            return [true];
        },
        default_rule: { // element's default rule
            required: true,
            check: null, // if check is null, use default checkers
            result: function (el, succ) {},
            messages: {
            },
            errorPlacement: null,
        },
        init: function () {
            var that = this;
            this.currentForm.find("input,select,textarea").each(function (i) {
                var el = this;
                // 忽略不可见及不可编辑的字段
                if (this.type == 'hidden' || this.disabled) {
                    return ;
                }
                // 忽略名字为空的字段
                if (!el.name) {
                    return ;
                }
                if (that.settings.ignoreNames.indexOf(el.name) != -1) {
                    return ;
                }
                if (that.settings.ignoreFn(el) === true) {
                    return ;
                }

                if (typeof that.fields[el.name] === 'undefined') {
                    that.fields[el.name] = el;
                } 
                // 如果是 radio, 则把它们放到同一个组里
                else if ($.isArray(that.fields[this.name])) {
                    that.fields[this.name].push(this);
                } else {
                    var old = that.fields[this.name];
                    that.fields[this.name] = [old, this];
                }
                if (el.name == 'budget[limit_num]') {
                    var a = '';
                }

                // >--- 规则正常化
                // 默认的规则
                var _rule = $.extend(true, {}, that.default_rule, that.settings.rules[el.name]);

                // 标准化 message
                var checkers = {}, messages = {};
                for (var ckr in that.defaults.checkers) {
                    if (typeof _rule[ckr] === 'string') {
                        messages[ckr] = _rule[ckr];
                    } else {
                        messages[ckr] = that.defaults.messages[ckr];
                    }
                }
                _rule.messages = $.extend(true, {}, that.defaults.messages, messages, _rule.messages);
                // 标准化 checkers
                for (var ckr in that.defaults.checkers) {
                    if (_rule[ckr]) {
                        checkers[ckr] = that.defaults.checkers[ckr];
                    }
                }
                _rule.checkers = checkers;

                that.rules[el.name] = _rule;
                // <--- 规则正常化

                // 监听每个元素的改变
                $(el).change(function (e) {
                    var name = el.name;

                    // 检查元素值是否有错
                    var result = that.check(el, _rule);
                    if (result[0]) {
                        that.clearError(el);
                    } else {
                        that.setError(el, result[1]);
                    }
                });
            });
        },
    });
    this.settings = $.extend(true, {}, this.defaults, options);
    this.currentForm = form;
    this.init();
    return this;
};
