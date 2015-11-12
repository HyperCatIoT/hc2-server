/**
 *
 *  Usage:
 *
 *       <pre json-pretty data="jsonObj"></pre>
 *
 *  @author Howard.Zuo
 *  @date Dec 5, 2014
 *
 **/
(function(global, angular, factory) {
    'use strict';

    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        global.JSONPretty = factory();
    }

}(window, angular, function() {

    'use strict';


    var replacer = function(match, pIndent, pKey, pVal, pEnd) {
        var key = '<span class=json-key>';
        var val = '<span class=json-value>';
        var str = '<span class=json-string>';
        var r = pIndent || '';
        if (pKey)
            r = r + key + "\"" + pKey.replace(/[": ]/g, '') + '"</span>: ';
        if (pVal)
            r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
        return r + (pEnd || '');
    };

    var prettyPrint = function(obj) {
        var jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg;

        var jsonObj = obj;
        var prettyJson;
        try {
            if (typeof obj === 'string') {
                jsonObj = JSON.parse(obj);
            }
            return JSON.stringify(jsonObj, null, 3)
                .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
                .replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(jsonLine, replacer);
        } catch (e) {
            return 'invalid JSON';
        }
    };

    var mod = angular.module('angular-json-pretty', []);

    var dir = function() {
        return {
            restrict: 'A',
            scope: {
                data: '='
            },
            link: function($scope, element) {
                $scope.$watch('data', function(newValue) {
                    if (!newValue) {
                        return;
                    }
                    element.html(prettyPrint(newValue));
                }, true);
            }
        };
    };

    mod.directive('jsonPretty', [dir]);

    return mod;
}));
