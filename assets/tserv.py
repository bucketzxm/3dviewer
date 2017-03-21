#!/usr/bin/env python
"""
Starts a Tornado static file server in a given directory.
To start the server in the current directory:

    tserv .

Then go to http://localhost:8000 to browse the directory.

Use the --prefix option to add a prefix to the served URL,
for example to match GitHub Pages' URL scheme:

    tserv . --prefix=jiffyclub

Then go to http://localhost:8000/jiffyclub/ to browse.

Use the --port option to change the port on which the server listens.

"""

import os
import sys
import logging
from argparse import ArgumentParser

import tornado.ioloop
import tornado.web

log = logging.getLogger(__name__)


class Handler(tornado.web.StaticFileHandler):
    def parse_url_path(self, url_path):
        log.info('parse_url_path: {}'.format(url_path))
        if not url_path or url_path.endswith('/'):
            url_path = url_path + 'index.html'
        return url_path

    def set_headers(self, *args, **kwargs):
        self.set_header('Access-Control-Allow-Origin', '*')
        self.set_header('Access-Control-Expose-Headers', 'Access-Control-Allow-Origin')
        self.set_header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        super(Handler, self).set_headers(*args, **kwargs);
        log.info('set headers {} {}'.format(args, kwargs))



def mkapp(prefix=''):
    if prefix:
        path = '/' + prefix + '/(.*)'
    else:
        path = '/(.*)'

    application = tornado.web.Application([
        (path, Handler, {'path': os.getcwd()}),
    ], debug=True)

    return application


def start_server(prefix='', port=8000):
    app = mkapp(prefix)
    app.listen(port)
    tornado.ioloop.IOLoop.instance().start()


def parse_args(args=None):
    parser = ArgumentParser(
        description=(
            'Start a Tornado server to serve static files out of a '
            'given directory and with a given prefix.'))
    parser.add_argument(
        '-f', '--prefix', type=str, default='',
        help='A prefix to add to the location from which pages are served.')
    parser.add_argument(
        '-p', '--port', type=int, default=8000,
        help='Port on which to run server.')
    parser.add_argument(
        'dir', help='Directory from which to serve files.')
    return parser.parse_args(args)


def main(args=None):
    args = parse_args(args)
    os.chdir(args.dir)
    log.info('starting server on port {}'.format(args.port))
    start_server(prefix=args.prefix, port=args.port)


if __name__ == '__main__':
    sys.exit(main())
