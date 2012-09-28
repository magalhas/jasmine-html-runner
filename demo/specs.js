describe("User", function () {
    it("should request a service", function () {
        spyOn(window, "load").andCallThrough();
        load("/api/result", function (xhr) {
            console.log(xhr);
            document.getElementById("container").innerHTML = xhr.responseText;
        });
        expect(load).toHaveBeenCalled();
        waitsFor(function () {
            return document.getElementById("container").innerHTML.length > 0;
        }, "result to load", 1000);
    });
    describe("after requesting the service", function () {
        it("should see the result on the screen", function () {
            expect(document.getElementById("container").innerHTML)
    			.toBe("{ \"success\": \"true\" }");
        });
    });
});