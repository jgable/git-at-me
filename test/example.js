/*globals describe, beforeEach, it*/
'use strict';

var _ = require('lodash'),
    should = require('should'),
    Cabinet = require('../lib/Cabinet');

describe('Cabinet', function () {

    var cabinet;

    beforeEach(function () {
        cabinet = new Cabinet({
            identifier: 'cabinet-fake',
            location: 'unit test',

            drawers: [{
                identifier: 'drawer-fake',
                type: 'test1'
            }]
        });
    });

    it('loads from a configuration object', function () {
        should.exist(cabinet);
        should.exist(cabinet.config);
    });

    it('has an identifier and location', function () {
        cabinet.identifier.should.equal('cabinet-fake');
        cabinet.location.should.equal('unit test');
    });

    it('has drawers', function () {
        should.exist(cabinet.drawers);

        cabinet.drawers.length.should.equal(1);
    });

    it('can sense the environment', function () {
        should.exist(cabinet.environment);
    });
});