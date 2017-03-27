

/* globals describe:true it:true expect:true */
import Ajax from '../src/ajax/ajax-xhr';


describe( '#Ajax', () => {

  it("specifying response when you need it", function() {
    var doneFn = jasmine.createSpy('success');
    jasmine.Ajax.withMock( function() {
      Ajax({ url: '/another/url', method: 'get' }).then( rs => {
        doneFn( rs );
      });

      expect( doneFn ).not.toHaveBeenCalled();

      jasmine.Ajax.requests.mostRecent().respondWith({
        status: 200,
        responseText: 'in spec response'
      });

      expect( doneFn ).toHaveBeenCalledWith( 'in spec response' );
    });
  });

  describe("suite wide usage", function() {

    beforeEach( function() {
      jasmine.Ajax.install();
    });

    afterEach( function() {
      jasmine.Ajax.uninstall();
    });

    it( "specifying response when you need it", function() {
      var doneFn = jasmine.createSpy("success");

      Ajax({ url: '/another/url', method: 'get' }).then( rs => {
        doneFn( rs );
      });

      jasmine.Ajax.requests.mostRecent().respondWith({
        "status": 200,
        "contentType": 'text/plain',
        "responseText": 'awesome response'
      });

      expect( doneFn ).toHaveBeenCalledWith( 'awesome response' );
    });

  });
});

