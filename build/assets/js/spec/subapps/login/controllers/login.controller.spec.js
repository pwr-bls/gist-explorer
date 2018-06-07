define([
    "app",
    "subapps/login/controllers/login.controller"
], function (App, LoginCtrl) {
    describe("loginView", function () {
        var view;
        beforeEach(function () {
            controller = new LoginCtrl();
        });
        afterEach(function () {
            controller.destroy();
        });
        it("should be defined", function () {
            expect(LoginCtrl).toBeDefined();
            expect(controller).toBeDefined();
        });
        describe("methods", function () {
            describe("start", function () {
                beforeEach(function () {
                    spyOn(controller, "show");
                    controller.start();
                });
                it("should call show method", function () {
                    expect(controller.show).toHaveBeenCalled();
                });
            });
            describe("show", function (){
                var _appRegion;
                beforeEach(function (){
                    _appRegion = App.appRegion;
                    spyOn(App.appRegion, "show");
                    spyOn(controller, "createLoginView").and.callThrough();
                    controller.show();
                });
                afterEach(function (){
                    App.appRegion = _appRegion
                });
                it("should call createLoginView method", function () {
                    expect(controller.createLoginView).toHaveBeenCalled();
                });
                it("should call show method on appRegion", function () {
                    expect(App.appRegion.show).toHaveBeenCalled();
                });

            });
        });
    });
});