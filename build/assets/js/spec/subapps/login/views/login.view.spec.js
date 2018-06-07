define([
    "app",
    "subapps/login/views/login.view"
], function (App, LoginView) {
    describe("loginView", function () {
        var view;
        beforeEach(function () {
            view = new LoginView();
        });
        afterEach(function () {
            view.destroy();
        });
        it("should be defined", function () {
            expect(LoginView).toBeDefined();
            expect(view).toBeDefined();
        });
        describe("methods", function () {
            describe("clickLogin", function (){
                it("should trigger event 'login:click'", function (){
                    spyOn(view, "trigger");
                    view.clickLogin();
                    expect(view.trigger).toHaveBeenCalledWith("login:click");
                });
            });
        });
    });
});