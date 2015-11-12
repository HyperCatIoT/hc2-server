"use strict";
/*eslint-env browser*/

angular.module('hypercat.controllers')
    .controller('EditorCtrl', [
        '$scope',
        'notifications',
        'QueryBuilderService',
        'CatService',
        /*eslint-disable max-params*/
        function($scope, notifications, QueryBuilderService, CatService) {
            $scope.url = '';
            $scope.cat = null;
            $scope.blankItem = {
                "i-object-metadata": [
                    {
                        "val": "test",
                        "rel": ""
                    }
                ],
                "href": ""
            };
            $scope.newItem = {
                val: JSON.stringify($scope.blankItem, null, "\t")
            };
            $scope.editorEnabled = true;

            // Check if we are using the hosted version
            if (window.location.hostname === 'hypercat.1248.io') {
                $scope.editorEnabled = false;
            }

            $scope.getCatMetadata = function() {
                if ($scope.cat !== null) {
                    return JSON.stringify($scope.cat['item-metadata'], null, "\t");
                }
                return '';
            };

            $scope.updateUrl = function() {
                $scope.url = QueryBuilderService.getCurrentUrl();
            };

            $scope.enableTabOnTextareas = function() {
                var textareas = document.getElementsByTagName('textarea'),
                    count = textareas.length,
                    i,
                    tabFunc = function(e) {
                        var s;
                        if ((e.keyCode === 9) || (e.which === 9)) {
                            e.preventDefault();
                            s = this.selectionStart;
                            this.value = this.value.substring(0, this.selectionStart) +
                                "\t" +
                                this.value.substring(this.selectionEnd);
                            this.selectionEnd = s + 1;
                        }
                    };

                // Loop through all textareas and set their onkeydown method to
                // the tabFunc declared above
                for (i = 0; i < count; i += 1) {
                    textareas[i].onkeydown = tabFunc;
                }
            };

            $scope.renderItems = function() {
                var i;

                for (i = 0; i < $scope.cat.items.length; i += 1) {
                    // Create a new property on each item with a stringified value
                    $scope.cat.items[i].$string = JSON.stringify(
                        $scope.cat.items[i],
                        null,
                        "\t"
                    );
                }

                setTimeout(function() {
                    // Enable tab on textareas after loading
                    $scope.enableTabOnTextareas();
                }, 1000);
            };

            $scope.updateCatalogue = function() {
                CatService.execute({
                    url: $scope.url
                }).then(function(cat) {
                    $scope.cat = cat;
                    $scope.renderItems();
                });
            };

            $scope.updateItem = function(index) {
                var item = $scope.cat.items[index];

                CatService.execute({
                    url: $scope.url + '?href=' + item.href,
                    method: 'PUT',
                    data: item.$string
                }).then(function() {
                    notifications.showSuccess({
                        message: 'Item was successfully updated!'
                    });
                }).catch(function(err) {
                    notifications.showError({
                        message: err
                    });
                });
            };

            $scope.addItem = function() {
                var itemObject;

                try {
                    itemObject = JSON.parse($scope.newItem.val);
                } catch (e) {
                    notifications.showError({
                        message: "Invalid JSON specified"
                    });
                    return;
                }

                CatService.execute({
                    url: $scope.url,
                    method: 'POST',
                    data: itemObject
                }).then(function() {
                    $scope.cat.items.push(itemObject);

                    // Re-render the items
                    $scope.renderItems();

                    // Clear the newItem model
                    $scope.newItem = JSON.stringify($scope.blankItem, null, "\t");

                    notifications.showSuccess({
                        message: 'Item was successfully added!'
                    });
                }).catch(function(err) {
                    notifications.showError({
                        message: err
                    });
                });
            };

            $scope.deleteItem = function(index, href) {
                CatService.execute({
                    url: $scope.url + '?href=' + encodeURIComponent(href),
                    method: 'DELETE'
                }).then(function() {
                    $scope.cat.items.splice(index, 1);
                    $scope.renderItems();

                    notifications.showSuccess({
                        message: 'Item was successfully deleted!'
                    });
                }).catch(function(err) {
                    notifications.showError({
                        message: err
                    });
                });
            };

            // Run initial methods
            $scope.updateUrl();
            $scope.updateCatalogue();
        }
    ]);
