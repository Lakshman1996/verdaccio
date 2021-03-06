import mime from 'mime';
import _ from 'lodash';
import {media, allow} from '../../middleware';
import {DIST_TAGS} from '../../../lib/utils';


export default function(route, auth, storage) {
  const can = allow(auth);
  const tag_package_version = function(req, res, next) {
    if (_.isString(req.body) === false) {
      return next('route');
    }

    let tags = {};
    tags[req.params.tag] = req.body;
    storage.mergeTags(req.params.package, tags, function(err) {
      if (err) {
        return next(err);
      }
      res.status(201);
      return next({ok: 'package tagged'});
    });
  };

  // tagging a package
  route.put('/:package/:tag',
    can('publish'), media(mime.getType('json')), tag_package_version);

  route.post('/-/package/:package/dist-tags/:tag',
    can('publish'), media(mime.getType('json')), tag_package_version);

  route.put('/-/package/:package/dist-tags/:tag',
    can('publish'), media(mime.getType('json')), tag_package_version);

  route.delete('/-/package/:package/dist-tags/:tag', can('publish'), function(req, res, next) {
    const tags = {};
    tags[req.params.tag] = null;
    storage.mergeTags(req.params.package, tags, function(err) {
      if (err) {
        return next(err);
      }
      res.status(201);
      return next({
        ok: 'tag removed',
      });
    });
  });

  route.get('/-/package/:package/dist-tags', can('access'), function(req, res, next) {
    storage.getPackage({
      name: req.params.package,
      req,
      callback: function(err, info) {
        if (err) {
          return next(err);
        }

        next(info[DIST_TAGS]);
      },
    });
  });

  route.post('/-/package/:package/dist-tags', can('publish'), function(req, res, next) {
      storage.mergeTags(req.params.package, req.body, function(err) {
        if (err) {
          return next(err);
        }
        res.status(201);
        return next({ok: 'tags updated'});
      });
    });
}
