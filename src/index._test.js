var BookmarkBuilder = require("./index.js");

var assert = require('assert');

var checkBuild = (bb, expected) => {
  var json = bb.build();

  // then
//  console.error("GOT: %s", JSON.stringify(json, null, 2))
  assert.equal(json.length, expected.length);
  assert.deepEqual(JSON.stringify(json, null, 2), JSON.stringify(expected, null, 2));
};

describe('BookmarkBuilder', function () {
  describe('#build()', function () {
    it('should return [] when no folder', function () {
      // setup
      var bb = new BookmarkBuilder();

      // when

      // then
      checkBuild(bb, []);
    });
  });

  describe('#addFolder()', function () {
    it('should add 1 row', function () {
      // setup
      var bb = new BookmarkBuilder();
      var name = "test_folderName";

      // when
      bb.addFolder(name);

      // then
      checkBuild(bb, [{ name, children: [] }]);

    });
    it('should add 2 nested rows', function () {
      // setup
      var bb = new BookmarkBuilder();
      var name = "test_folderName";

      // when
      bb.addFolder(name).addFolder(name);

      // then
      checkBuild(bb, [
        {
          name, children: [
            { name, children: [] }
          ]
        }
      ]);
    });

    it('should add 3 nested rows', function () {
      // setup
      var bb = new BookmarkBuilder();
      var name = "test_folderName";

      // when
      bb.addFolder(name).addFolder(name).addFolder(name);

      // then
      checkBuild(bb, [
        {
          name, children: [
            {
              name, children: [
                { name, children: [] }
              ]
            }
          ]
        }
      ]);
    });
  });

  describe('#endFolder()', function () {
    it('should add 2 rows on same level', function () {
      // setup
      var bb = new BookmarkBuilder();
      var name = "test_folderName";

      // when
      bb.addFolder(name).endFolder().addFolder(name);

      // then
      checkBuild(bb, [
        { name, children: [] },
        { name, children: [] }
      ]);

    });
    it('should add 2 rows on same level + nested folder', function () {
      // setup
      var bb = new BookmarkBuilder();
      var name = "test_folderName";

      // when
      bb.addFolder(name).endFolder().addFolder(name).addFolder(name);

      // then
      checkBuild(bb, [
        { name, children: [] },
        {
          name, children: [
            { name, children: [] }
          ]
        }
      ]);
    });

  });
  describe('#goToRoot()', function () {
    it('should go to root when at root', function () {
      // setup
      var bb = new BookmarkBuilder();
      var name = "test_folderName";

      // when
      bb.goToRoot();

      // then
      checkBuild(bb, []);

    });
    it('should add 2 rows on same level + nested folder', function () {
      // setup
      var bb = new BookmarkBuilder();
      var name = "test_folderName";
      const linkName = "test_linkName";
      const linkHref = "test_linkHref";

      // when
      bb.addFolder(name).goToRoot()
        .addFolder(name)
            .addFolder(name)
        .goToRoot()
        .addLink(linkName, linkHref);

      // then
      checkBuild(bb, [
        { name, children: [] },
        {
          name, children: [
            { name, children: [] }
          ]
        },
        {name: linkName, href: linkHref}
      ]);
    });

  });

    describe('#reset()', function () {
      it('should reset when empty', function () {
        // setup
        var bb = new BookmarkBuilder();
        var name = "test_folderName";

        // when
        bb.reset();

        // then
        checkBuild(bb, []);

      });
      it('should clear out folders when reset', function () {
        // setup
        var bb = new BookmarkBuilder();
        var name = "test_folderName";

        // when
        bb.addFolder(name).endFolder().addFolder(name).addFolder(name);
        bb.reset();

        // then
        checkBuild(bb, []);
      });

    });

    describe('#addLink()', function () {
      it('should be able to add links at root level', function () {
        // setup
        var bb = new BookmarkBuilder();
        var name = "test_folderName";
        const linkName = "test_linkName"
        const linkHref = "test_linkHref";

        // when
        bb.addLink(linkName, linkHref);

        // then
        checkBuild(bb, [{name : linkName, href: linkHref}]);

      });
      it('should clear out folders when reset', function () {
        // setup
        var bb = new BookmarkBuilder();
        var name = "test_folderName";
        const linkName = "test_linkName"
        const linkHref = "test_linkHref";

        // when
        bb.addLink(linkName, linkHref)
            .addFolder(name)
                .addLink(linkName, linkHref)
            .endFolder()
            .addFolder(name)
                .addFolder(name)
                    .addLink(linkName, linkHref);

        // then
          checkBuild(bb, [
            { name: linkName, href: linkHref},
            { name, children: [
                { name: linkName, href: linkHref},
            ] },
            {
              name, children: [
                { name, children: [
                    { name: linkName, href: linkHref}
                ] }
              ]
            }
          ]);
      });

    });

    describe("#addFolders()", () => {
       it('should add 3 nested rows', function () {
         // setup
         var bb = new BookmarkBuilder();
         var name = "test_folderName";

         // when
         bb.addFolders([name,name,name]);

         // then
         checkBuild(bb, [
           {
             name, children: [
               {
                 name, children: [
                   { name, children: [] }
                 ]
               }
             ]
           }
         ]);
       });
    });

    describe("#addLinks()", () => {
       it('should add 3 links', function () {
         // setup
         var bb = new BookmarkBuilder();
         var name = "test_linkName";
         var href = "test_href";

         // when
         bb.addLinks([{name, href}, {name, href},{name, href}]);

         // then
         checkBuild(bb, [
           { name, href },
           { name, href },
           { name, href }
         ]);
       });
    });
    describe("#computeLinks()", () => {
       it('should add 3 computed links', function () {
         // setup
         var bb = new BookmarkBuilder();
         var name = "test_linkName";
         var href = "test_href";

         // when
         bb.computeLinks([name, name, name], (n) => ({name: n, href}) );

         // then
         checkBuild(bb, [
           { name, href },
           { name, href },
           { name, href }
         ]);
       });
    });

});