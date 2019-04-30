/**
 * JavaScript parsing of linkheaders from http://tools.ietf.org/html/draft-nottingham-http-link-header-10
 *
 * Depends on jQuery and $.uritemplate
 * Usage:
 *
 * var linkHeader = 'Link: </collection/{itemId}>; rel="foo foz bar"; type="application/json", </fozzes/{fozId}>; rel="foz baz"; type="application/json"';
 * var links = $.linkheaders(linkHeader);
 * links.find('foo bar').href().expand({ itemId: 'xxx' }) => /collection/xxx
 * links.find(['foz']).href().expand({ itemId: 'xxx' }) => /collection/xxx
 * links.find('baz').rel() => 'foz baz'
 * links.find('foz').rel() => 'application/json
 * links.each() => iterator
 */

(function($, undefined) {
  var LINK_PREAMBLE = /^Link\s*:\s*/
      URI_TEMPLATE = /^\s*<(.+)>/,
      RELS = /rel\s*=\s*"([^"]+)"/,
      ATTR_NAMES = ['anchor', 'rev', 'hreflang', 'media', 'title', 'type'];

  function Link(link) {
    var attrs = {},
        href,
        rels;

    href = (link.match(URI_TEMPLATE) || [])[1];
    rels = ((link.match(RELS) || [])[1] || '').split(' ');
    $.each(ATTR_NAMES, function(i, name) {
      var re = new RegExp(name + '\s*=\s*"([^"]+)"');
      attrs[name] = (link.match(re) || [])[1] || '';
    });


    return {
      attr: function(key) {
        return attrs[key];
      },
      href: function() {
        return $.uritemplate(href);
      },
      rels: function() {
        return rels;
      },
      match: function(matches) {
        matches = $.isArray(matches) ? matches : matches.split(' ');

        for (var i = 0; i < matches.length; i++) {
          var match = matches[i];
          if ($.inArray(match, rels) < 0) {
            return false;
          }
        }
        return true;
      }
    }
  }

  function Links(header) {
    var links = [];
    header = $.trim(header) || '';

    if (header.match(LINK_PREAMBLE)) {
      header = header.replace(LINK_PREAMBLE, '');
      $.each(header.split(','), function(i, link) {
        link = new Link(link);
        links.push(link);
      });
    }

    function find(rels) {
      var i, link;
      for (i = 0; i < links.length; i++) {
        link = links[i];
        if (link.match(rels)) {
          return link;
        }
      }
      return null;
    }

    return {
      find: find
    }
  }

  function linkheader(header) {
    return new Links(header);
  }

  $.extend({
    linkheader: linkheader
  })

})(jQuery);